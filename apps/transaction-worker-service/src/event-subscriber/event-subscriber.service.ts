import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  EventStoreDBClient,
  persistentSubscriptionToStreamSettingsFromDefaults,
} from '@eventstore/db-client';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EventSubscriberService implements OnModuleInit {
  private eventStoreClient = EventStoreDBClient.connectionString(
    process.env.EVENTSTOREDB_URI || 'esdb://localhost:2113?tls=false'
  );

  constructor(
    @InjectQueue('transaction-created-event-forwarding')
    private eventQueue: Queue
  ) {}

  private serializeEvent(event: any) {
    return JSON.parse(
      JSON.stringify(event, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  async onModuleInit() {
    const streamName = 'transactions';
    const groupName = 'transactions-read-model-group';

    await this.ensurePersistentSubscription(streamName, groupName);
    const subscription =
      this.eventStoreClient.subscribeToPersistentSubscriptionToStream(
        streamName,
        groupName
      );

    for await (const resolvedEvent of subscription) {
      if (!resolvedEvent.event) continue;

      // Serialize the event data to handle BigInt values
      const serializedEvent = this.serializeEvent(resolvedEvent.event);
      await this.eventQueue.add('transaction-created-event-forwarding', {
        event: serializedEvent,
      });
      Logger.log(`Event ${serializedEvent.id} forwarded to BullMQ`);
    }
  }

  private async ensurePersistentSubscription(stream: string, group: string) {
    try {
      await this.eventStoreClient.createPersistentSubscriptionToStream(
        stream,
        group,
        persistentSubscriptionToStreamSettingsFromDefaults({
          startFrom: 'start',
          maxRetryCount: 5,
          checkPointAfter: 2_000,
        })
      );

      Logger.log(
        `Created persistent subscription [${group}] on stream [${stream}]`
      );
    } catch (error: any) {
      if (error.type === 'ALREADY_EXISTS') {
        Logger.log(`Persistent subscription [${group}] already exists`);
      } else {
        Logger.error('Error creating persistent subscription', error);
        throw error;
      }
    }
  }
}
