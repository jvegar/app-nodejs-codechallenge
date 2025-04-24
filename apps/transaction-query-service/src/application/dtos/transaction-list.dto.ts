import { TransactionReadDto } from './transaction-read.dto';

export class TransactionListDto {
  transactions: TransactionReadDto[];

  constructor(transactions: TransactionReadDto[]) {
    this.transactions = transactions;
  }
}
