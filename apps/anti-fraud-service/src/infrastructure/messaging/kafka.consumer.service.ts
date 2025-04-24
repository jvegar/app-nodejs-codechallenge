import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern } from '@nestjs/microservices';
import { KafkaConsumerPort } from '../../domain/ports/kafka-consumer.port';
import { TransactionCreatedEvent } from '../../application/events/transaction-created.event';
import { TransactionCreatedHandler } from '../../application/events/handlers/transaction-created.handler';

@Injectable()
export class KafkaConsumerService implements KafkaConsumerPort, OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly handler: TransactionCreatedHandler
  ) {
    this.logger.log('KafkaConsumerService instantiated');
  }

  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      this.logger.log('Kafka client connected successfully');
    } catch (error) {
      this.logger.error(
        `Failed to connect Kafka client: ${error.message}`,
        error.stack
      );
    }
  }

  @EventPattern('transaction-created')
  async handleTransactionCreated(event: TransactionCreatedEvent) {
    this.logger.log(`Event received from transaction-created topic`);
    this.handler.handleTransactionCreated(event);
  }
}
