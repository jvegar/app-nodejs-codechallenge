import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionReadRepositoryPort } from '../../domain/ports/transaction-read.repository.port';
import { TransactionReadEntity } from './transaction-read.entity';
import { TransactionReadModel } from '../../domain/models/transaction.model';

@Injectable()
export class TransactionReadRepository
  implements TransactionReadRepositoryPort
{
  constructor(
    @InjectRepository(TransactionReadEntity)
    private readonly transactionReadRepository: Repository<TransactionReadEntity>
  ) {}

  async save(transaction: TransactionReadModel): Promise<void> {
    await this.transactionReadRepository.save({
      transactionExternalId: transaction.transactionExternalId,
      accountExternalIdDebit: transaction.accountExternalIdDebit,
      accountExternalIdCredit: transaction.accountExternalIdCredit,
      transactionTypeId: transaction.transactionTypeId,
      transactionTypeName: transaction.transactionTypeName,
      transactionStatusId: transaction.transactionStatusId,
      transactionStatusName: transaction.transactionStatusName,
      value: transaction.value,
      createdAt: transaction.createdAt || new Date(),
    } as any); // Cast to any to bypass TypeORM type checking
  }

  async findById(transactionExternalId: string): Promise<TransactionReadModel> {
    const transaction = await this.transactionReadRepository.findOne({
      where: { transactionExternalId },
    });

    return transaction
      ? new TransactionReadModel(
          transaction.transactionExternalId,
          transaction.accountExternalIdDebit,
          transaction.accountExternalIdCredit,
          transaction.transactionTypeId as unknown as number,
          transaction.transactionTypeName,
          transaction.transactionStatusId as unknown as number,
          transaction.transactionStatusName,
          transaction.value,
          transaction.createdAt
        )
      : null;
  }

  async findAll(): Promise<TransactionReadModel[]> {
    const transactions = await this.transactionReadRepository.find();
    return transactions.map(
      (transaction) =>
        new TransactionReadModel(
          transaction.transactionExternalId,
          transaction.accountExternalIdDebit,
          transaction.accountExternalIdCredit,
          transaction.transactionTypeId as unknown as number,
          transaction.transactionTypeName,
          transaction.transactionStatusId as unknown as number,
          transaction.transactionStatusName,
          transaction.value,
          transaction.createdAt
        )
    );
  }
}
