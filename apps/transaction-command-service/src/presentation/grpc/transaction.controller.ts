import {
  Controller,
  Logger,
  Inject,
  UsePipes,
  ValidationPipe,
  UseFilters,
} from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../../application/commands/create-transaction.command';
import { CreateResponse } from './proto/transaction';
import { ClientKafka } from '@nestjs/microservices';
import { CreateTransactionDto } from '../../application/dtos/create-transaction.dto';
import { Http2gRPCExceptionFilter } from '../../infrastructure/filters/htt2gRPCException.filter';

@Controller()
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly commandBus: CommandBus,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  @GrpcMethod('TransactionService', 'CreateTransaction')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(new Http2gRPCExceptionFilter())
  async createTransaction(data: CreateTransactionDto): Promise<CreateResponse> {
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

      this.kafkaClient.emit('transaction-created', {
        key: transactionId,
        value: JSON.stringify(eventPayload),
      });

      this.logger.log(
        `Transaction-created event emitted: ${JSON.stringify({
          ...eventPayload,
          timestamp: new Date(eventPayload.timestamp).toISOString(), // Convert back to ISO string for logging
        })}`
      );

      return { transactionId };
    } catch (error) {
      this.logger.error('Error creating transaction', error.stack);
      throw new RpcException(
        `An error occurred while creating the transaction: ${error.message}`
      );
    }
  }
}
