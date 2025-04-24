import { Controller, Logger, Inject } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../../application/commands/create-transaction.command';
import { CreateTransactionDto } from '../../application/dtos/create-transaction.dto';
import { ClientKafka } from '@nestjs/microservices';

@Controller()
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly commandBus: CommandBus,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  @GrpcMethod('TransactionService', 'CreateTransaction')
  async createTransaction(
    data: CreateTransactionDto
  ): Promise<{ transactionId: string }> {
    try {
      const {
        accountExternalIdDebit,
        accountExternalIdCredit,
        transferTypeId,
        value,
      } = data;

      // Execute the command to create the transaction
      const { transactionId } = await this.commandBus.execute(
        new CreateTransactionCommand(
          accountExternalIdDebit,
          accountExternalIdCredit,
          transferTypeId,
          value
        )
      );

      // Emit the transaction-created event to Kafka
      const eventPayload = {
        transactionId,
        accountExternalIdDebit,
        accountExternalIdCredit,
        transferTypeId,
        value,
        timestamp: Date.now(),
      };

      this.kafkaClient.emit('transaction-created', eventPayload);
      this.logger.log(
        `Transaction-created event emitted: ${JSON.stringify({
          ...eventPayload,
          timestamp: new Date(eventPayload.timestamp).toISOString(), // Convert back to ISO string for logging
        })}`
      );

      return { transactionId };
    } catch (error) {
      // Log the error details
      this.logger.error('Error creating transaction', error.stack);

      // Include the error message in the RpcException
      throw new RpcException(
        `An error occurred while creating the transaction: ${error.message}`
      );
    }
  }
}
