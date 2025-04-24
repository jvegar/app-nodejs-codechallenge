import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetTransactionQuery } from '../../application/queries/get-transaction.query';
import { ListTransactionsQuery } from '../../application/queries/list-transactions.query';
import { TransactionReadDto } from '../../application/dtos/transaction-read.dto';
import { TransactionListDto } from '../../application/dtos/transaction-list.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getTransactionById(
    @Param('id') id: string
  ): Promise<TransactionReadDto | null> {
    return this.queryBus.execute(new GetTransactionQuery(id));
  }

  @Get()
  async list(): Promise<TransactionListDto> {
    return this.queryBus.execute(new ListTransactionsQuery());
  }
}
