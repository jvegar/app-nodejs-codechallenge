import { Injectable, Inject, Logger } from '@nestjs/common';
import { FraudCheckService } from '../../services/fraud-check.service';
import { KafkaProducerPort } from '../../../domain/ports/kafka-producer.port';
import { TransactionCreatedEvent } from '../transaction-created.event';
import { AntiFraudResultEvent } from '../anti-fraud-result.event';

@Injectable()
export class TransactionCreatedHandler {
  private readonly logger = new Logger(TransactionCreatedHandler.name);

  constructor(
    @Inject('KAFKA_PRODUCER_PORT')
    private readonly kafkaProducer: KafkaProducerPort,
    private readonly fraudCheckService: FraudCheckService
  ) {}

  async handleTransactionCreated(event: TransactionCreatedEvent) {
    this.logger.log(
      `Processing transaction for fraud check: ${event.transactionId}`
    );

    try {
      const fraudResult = await this.fraudCheckService.evaluate(event);

      const resultEvent = new AntiFraudResultEvent(
        event.transactionId,
        event.value,
        Date.now(),
        fraudResult.transactionStatusId
      );

      await this.kafkaProducer.emit('fraud-check-result', resultEvent);
      this.logger.log(
        `Fraud check result emitted for transaction: ${event.transactionId}, status: ${fraudResult.transactionStatusId}`
      );
    } catch (error) {
      this.logger.error(
        `Error processing fraud check: ${error.message}`,
        error.stack
      );
    }
  }
}
