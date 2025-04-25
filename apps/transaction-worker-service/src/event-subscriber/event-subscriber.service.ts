import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventStoreDBClient } from '@eventstore/db-client';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EventSubscriberService implements OnModuleInit {
  private eventStoreClient = EventStoreDBClient.connectionString(
    process.env.EVENTSTOREDB_URI || 'esdb://localhost:2113?tls=false',
  );

  constructor(
    @InjectQueue('transaction-created-event-forwarding') private eventQueue: Queue,
  ) {}

  private serializeEvent(event: any) {
    return JSON.parse(JSON.stringify(event, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  async onModuleInit() {
    const subscription = this.eventStoreClient.subscribeToPersistentSubscriptionToStream(
        'transactions',
        'transactions-read-model-group'
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
}