import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTransactionQuery } from '../get-transaction.query';
import { TransactionReadRepositoryPort } from '../../../domain/ports/transaction-read.repository.port';
import { TransactionReadDto } from '../../../application/dtos/transaction-read.dto';

@QueryHandler(GetTransactionQuery)
export class GetTransactionHandler
  implements IQueryHandler<GetTransactionQuery>
{
  constructor(
    @Inject('TRANSACTION_READ_REPOSITORY')
    private readonly transactionReadRepository: TransactionReadRepositoryPort
  ) {}

  async execute(
    query: GetTransactionQuery
  ): Promise<TransactionReadDto | { message: string }> {
    const transaction = await this.transactionReadRepository.findById(
      query.transactionExternalId
    );
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
}
