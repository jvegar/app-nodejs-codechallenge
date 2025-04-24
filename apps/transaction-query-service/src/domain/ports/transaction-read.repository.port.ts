import { TransactionReadModel } from '../models/transaction.model';

export interface TransactionReadRepositoryPort {
  save(transaction: TransactionReadModel): Promise<void>;
  findById(transactionId: string): Promise<TransactionReadModel | null>;
  findAll(): Promise<TransactionReadModel[]>;
}
