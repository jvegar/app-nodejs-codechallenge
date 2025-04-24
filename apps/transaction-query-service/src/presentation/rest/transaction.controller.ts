import { Controller, Get, Param, Inject } from '@nestjs/common';
import { TransactionReadRepositoryPort } from '../../domain/ports/transaction-read.repository.port';
import { TransactionReadDto } from '../../application/dtos/transaction-read.dto';
import { TransactionListDto } from '../../application/dtos/transaction-list.dto';

@Controller('transactions')
export class TransactionController {
  constructor(
    @Inject('TRANSACTION_READ_REPOSITORY')
    private readonly transactionReadRepository: TransactionReadRepositoryPort
  ) {}

  @Get(':id')
  async getTransactionById(
    @Param('id') id: string
  ): Promise<TransactionReadDto | { message: string }> {
    const transaction = await this.transactionReadRepository.findById(id);
    if (!transaction) {
      return { message: 'Transaction not found' };
    }
    return new TransactionReadDto(
      transaction.transactionExternalId,
      transaction.accountExternalIdDebit,
      transaction.accountExternalIdCredit,
      transaction.transactionTypeId,
      transaction.transactionTypeName,
      transaction.transactionStatusId,
      transaction.transactionStatusName,
      transaction.value,
      transaction.createdAt
    );
  }

  @Get()
  async list(): Promise<TransactionListDto> {
    const transactions = await this.transactionReadRepository.findAll();
    return new TransactionListDto(
      transactions.map(
        (transaction) =>
          new TransactionReadDto(
            transaction.transactionExternalId,
            transaction.accountExternalIdDebit,
            transaction.accountExternalIdCredit,
            transaction.transactionTypeId,
            transaction.transactionTypeName,
            transaction.transactionStatusId,
            transaction.transactionStatusName,
            transaction.value,
            transaction.createdAt
          )
      )
    );
  }
}
