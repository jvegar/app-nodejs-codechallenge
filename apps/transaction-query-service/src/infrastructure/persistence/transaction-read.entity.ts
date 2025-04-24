import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('transaction_read')
export class TransactionReadEntity {
  @PrimaryColumn({ name: 'transaction_external_id' })
  transactionExternalId: string;

  @Column({ name: 'account_external_id_debit' })
  accountExternalIdDebit: string;

  @Column({ name: 'account_external_id_credit' })
  accountExternalIdCredit: string;

  @Column({ name: 'transaction_type_id' })
  transactionTypeId: number;

  @Column({ name: 'transaction_type_name' })
  transactionTypeName: string;

  @Column({ name: 'transaction_status_id' })
  transactionStatusId: number;

  @Column({ name: 'transaction_status_name' })
  transactionStatusName: string;

  @Column()
  value: number;

  @Column({ name: 'created_at' })
  createdAt: Date;
}
