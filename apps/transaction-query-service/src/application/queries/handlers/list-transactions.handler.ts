import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListTransactionsQuery } from '../list-transactions.query';
import { TransactionReadRepositoryPort } from '../../../domain/ports/transaction-read.repository.port';
import { TransactionListDto } from '../../dtos/transaction-list.dto';

@QueryHandler(ListTransactionsQuery)
export class ListTransactionsHandler
  implements IQueryHandler<ListTransactionsQuery>
{
  constructor(
    private readonly transactionReadRepository: TransactionReadRepositoryPort
  ) {}

  async execute(query: ListTransactionsQuery): Promise<TransactionListDto> {
    const transactions = await this.transactionReadRepository.findAll();
    return new TransactionListDto(
      transactions.map((transaction) => ({
        transactionExternalId: transaction.transactionExternalId,
        accountExternalIdDebit: transaction.accountExternalIdDebit,
        accountExternalIdCredit: transaction.accountExternalIdCredit,
        transactionTypeId: transaction.transactionTypeId,
        transactionTypeName: transaction.transactionTypeName,
        transactionStatusId: transaction.transactionStatusId,
        transactionStatusName: transaction.transactionStatusName,
        value: transaction.value,
        createdAt: transaction.createdAt,
      }))
    );
  }
}
