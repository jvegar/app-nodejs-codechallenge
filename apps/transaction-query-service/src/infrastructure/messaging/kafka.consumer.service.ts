import {
  Injectable,
  OnModuleInit,
  Logger,
  Inject,
  Controller,
} from '@nestjs/common';
import { ClientKafka, EventPattern } from '@nestjs/microservices';
import { TransactionCreatedEvent } from '../../application/events/transaction-created.event';
import { TransactionReadRepositoryPort } from '../../domain/ports/transaction-read.repository.port';
import { TransactionReadModel } from '../../domain/models/transaction.model';

@Injectable()
@Controller()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    @Inject('TRANSACTION_READ_REPOSITORY')
    private readonly transactionReadRepository: TransactionReadRepositoryPort,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
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
    try {
      const {
        transactionId,
        accountExternalIdDebit,
        accountExternalIdCredit,
        transferTypeId,
        value,
        timestamp,
      } = event;

      if (!transactionId) {
        this.logger.error(
          `Missing transactionId in event: ${JSON.stringify(event)}`
        );
        return;
      }

      const typeName = transferTypeId === 1 ? 'peer-to-peer' : 'merchant';
      const statusId = 1;
      const statusName = 'pending';
      const createdAt =
        typeof timestamp === 'number' ? new Date(timestamp) : new Date();

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

      this.logger.log(`Transaction processed and saved: ${transactionId}`);
    } catch (error) {
      this.logger.error(
        `Error processing event: ${error.message}`,
        error.stack
      );
    }
  }
}
