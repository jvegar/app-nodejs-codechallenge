import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListTransactionsQuery } from '../list-transactions.query';
import { TransactionReadRepositoryPort } from '../../../domain/ports/transaction-read.repository.port';
import { TransactionListDto } from '../../dtos/transaction-list.dto';
import { TransactionReadDto } from '../../dtos/transaction-read.dto';

@QueryHandler(ListTransactionsQuery)
export class ListTransactionsHandler
  implements IQueryHandler<ListTransactionsQuery>
{
  constructor(
    @Inject('TRANSACTION_READ_REPOSITORY')
    private readonly transactionReadRepository: TransactionReadRepositoryPort
  ) {}

  async execute(query: ListTransactionsQuery): Promise<TransactionListDto> {
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
