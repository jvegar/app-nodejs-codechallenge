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

      return { transactionId };
    } catch (error) {
      this.logger.error('Error creating transaction', error.stack);
      throw new RpcException(
        `An error occurred while creating the transaction: ${error.message}`
      );
    }
  }
}
