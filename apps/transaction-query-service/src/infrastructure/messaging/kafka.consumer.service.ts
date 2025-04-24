import {
  Injectable,
  OnModuleInit,
  Logger,
  Inject,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ClientKafka, EventPattern } from '@nestjs/microservices';
import { Kafka, Consumer, KafkaMessage } from 'kafkajs';
import { TransactionCreatedEvent } from '../../application/events/transaction-created.event';
import { TransactionReadRepositoryPort } from '../../domain/ports/transaction-read.repository.port';
import { TransactionReadModel } from '../../domain/models/transaction.model';

@Injectable()
export class KafkaConsumerService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(KafkaConsumerService.name);
  private directConsumer: Consumer;
  private directKafka: Kafka;

  constructor(
    @Inject('TRANSACTION_READ_REPOSITORY')
    private readonly transactionReadRepository: TransactionReadRepositoryPort,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {
    // Initialize direct KafkaJS consumer as a backup
    this.directKafka = new Kafka({
      clientId:
        process.env.KAFKA_CLIENT_ID || 'transaction-query-service-direct',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.directConsumer = this.directKafka.consumer({
      groupId: `${
        process.env.KAFKA_GROUP_ID || 'transaction-query-group'
      }-direct`,
    });
  }

  async onModuleInit() {
    // Connect NestJS Kafka client
    await this.kafkaClient.connect();
    this.logger.log('NestJS Kafka client connected');

    // Connect and setup direct consumer
    try {
      await this.directConsumer.connect();
      await this.directConsumer.subscribe({
        topic: 'transaction-created',
        fromBeginning: true,
      });

      await this.directConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            this.logger.log(
              `[Direct Consumer] Message received from topic ${topic}`
            );
            await this.processMessage(message);
          } catch (error) {
            this.logger.error(
              `[Direct Consumer] Error processing message: ${error.message}`,
              error.stack
            );
          }
        },
      });

      this.logger.log(
        'Direct Kafka consumer connected and subscribed to transaction-created'
      );
    } catch (error) {
      this.logger.error(
        `Failed to setup direct consumer: ${error.message}`,
        error.stack
      );
    }
  }

  async onApplicationShutdown() {
    try {
      await this.directConsumer.disconnect();
      this.logger.log('Direct Kafka consumer disconnected');
    } catch (error) {
      this.logger.error(
        `Error disconnecting direct consumer: ${error.message}`
      );
    }
  }

  private async processMessage(message: KafkaMessage) {
    if (!message.value) {
      this.logger.warn('Received message with no value');
      return;
    }

    try {
      const stringValue = message.value.toString();
      this.logger.debug(`Raw message value: ${stringValue}`);

      let eventData: any;
      try {
        // Try to parse the message value as JSON
        eventData = JSON.parse(stringValue);
      } catch (e) {
        this.logger.warn(
          `Could not parse message as JSON: ${stringValue}. Error: ${e.message}`
        );
        // If parsing fails, try using the raw string value
        eventData = { value: stringValue };
        return;
      }

      this.logger.debug(`Parsed event data: ${JSON.stringify(eventData)}`);

      // Extract event properties safely
      const transactionId = eventData.transactionId;
      const accountExternalIdDebit = eventData.accountExternalIdDebit;
      const accountExternalIdCredit = eventData.accountExternalIdCredit;
      const transferTypeId = eventData.transferTypeId;
      const value = eventData.value;
      const timestamp = eventData.timestamp;

      if (!transactionId) {
        this.logger.error(
          `Missing transactionId in event: ${JSON.stringify(eventData)}`
        );
        return;
      }

      const typeName = transferTypeId === 1 ? 'peer-to-peer' : 'merchant';
      const statusId = 1;
      const statusName = 'pending';

      // Convert numeric timestamp to Date object
      const createdAt =
        typeof timestamp === 'number'
          ? new Date(timestamp)
          : timestamp instanceof Date
          ? timestamp
          : new Date();

      this.logger.debug(
        `Saving transaction: ${JSON.stringify({
          transactionId,
          accountExternalIdDebit,
          accountExternalIdCredit,
          transferTypeId,
          typeName,
          statusId,
          statusName,
          value,
          createdAt,
        })}`
      );

      await this.transactionReadRepository.save(
        new TransactionReadModel(
          transactionId,
          accountExternalIdDebit,
          accountExternalIdCredit,
          transferTypeId,
          typeName,
          statusId,
          statusName,
          value,
          createdAt
        )
      );

      this.logger.log(`Processed transaction: ${transactionId}`);
    } catch (error) {
      this.logger.error(
        `Error processing message: ${error.message}`,
        error.stack
      );
    }
  }

  // Keep the NestJS EventPattern handler as well
  @EventPattern('transaction-created')
  async handleTransactionCreated(event: any) {
    try {
      this.logger.debug(
        `[NestJS Consumer] Received event: ${JSON.stringify(event)}`
      );

      // Handle different possible message formats
      if (event && event.key && event.value) {
        // Format from our command service with key-value
        try {
          if (typeof event.value === 'string') {
            await this.processMessage({
              value: Buffer.from(event.value),
            } as KafkaMessage);
          } else {
            await this.processMessage({
              value: Buffer.from(JSON.stringify(event.value)),
            } as KafkaMessage);
          }
        } catch (err) {
          this.logger.error(`Error processing key-value event: ${err.message}`);
        }
      } else if (event && typeof event === 'object') {
        // Direct object format
        await this.processMessage({
          value: Buffer.from(JSON.stringify(event)),
        } as KafkaMessage);
      } else if (typeof event === 'string') {
        // String format
        await this.processMessage({
          value: Buffer.from(event),
        } as KafkaMessage);
      } else {
        this.logger.warn(
          `Received event in unexpected format: ${typeof event}`
        );
      }
    } catch (error) {
      this.logger.error(
        `[NestJS Consumer] Error processing event: ${error.message}`,
        error.stack
      );
    }
  }
}
