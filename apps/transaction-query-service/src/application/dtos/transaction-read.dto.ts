export class TransactionReadDto {
  transactionExternalId: string;
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transactionTypeId: number;
  transactionTypeName: string;
  transactionStatusId: number;
  transactionStatusName: string;
  value: number;
  createdAt: Date;

  constructor(
    transactionExternalId: string,
    accountExternalIdDebit: string,
    accountExternalIdCredit: string,
    tramsactionTypeId: number,
    transactionTypeName: string,
    transactionStatusId: number,
    transactionStatusName: string,
    value: number,
    createdAt: Date
  ) {
    this.transactionExternalId = transactionExternalId;
    this.accountExternalIdDebit = accountExternalIdDebit;
    this.accountExternalIdCredit = accountExternalIdCredit;
    this.transactionTypeId = tramsactionTypeId;
    this.transactionTypeName = transactionTypeName;
    this.transactionStatusId = transactionStatusId;
    this.transactionStatusName = transactionStatusName;
    this.value = value;
    this.createdAt = createdAt;
  }
}
