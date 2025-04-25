import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Processor('transaction-created-event-forwarding')
export class EventForwarderProcessor implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  @Process('transaction-created-event-forwarding')
  async handleEvent(job: Job<{ event: any }>) {
    const event = job.data.event;
    try {
      await this.kafkaClient.emit('transaction-created', {
        id: event.data.aggregateId,
        value: event.data.eventData
      });
      Logger.log(`Event ${event.id} forwarded to Kafka`);
    } catch (error) {
      Logger.error('Failed to forward event:', error);
      throw error;
    }
  }
}