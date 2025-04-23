import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../../application/commands/create-transaction.command';
import { CreateTransactionDto } from '../../application/dtos/create-transaction.dto';

@Controller()
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(private readonly commandBus: CommandBus) {}

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
      // Log the error details
      this.logger.error('Error creating transaction', error.stack);

      // Include the error message in the RpcException
      throw new RpcException(
        `An error occurred while creating the transaction: ${error.message}`
      );
    }
  }
}
