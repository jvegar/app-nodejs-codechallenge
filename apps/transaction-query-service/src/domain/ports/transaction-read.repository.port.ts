import { TransactionReadModel } from '../models/transaction.model';

export interface TransactionReadRepositoryPort {
  save(transaction: TransactionReadModel): Promise<void>;
  updateStatus(
    transactionId: string,
    transactionStatusId: number,
    transactionStatusName: string
  ): Promise<void>;
  findById(transactionId: string): Promise<TransactionReadModel | null>;
  findAll(): Promise<TransactionReadModel[]>;
}
