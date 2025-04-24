export class TransactionReadDto {
  transacionExternalId: string;
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transactionTypeId: number;
  transactionTypeName: string;
  transactionStatusId: number;
  transactionStatusName: string;
  value: number;
  createdAt: Date;

  constructor(
    transacionExternalId: string,
    accountExternalIdDebit: string,
    accountExternalIdCredit: string,
    tramsactionTypeId: number,
    transactionTypeName: string,
    transactionStatusId: number,
    transactionStatusName: string,
    value: number,
    createdAt: Date
  ) {
    this.transacionExternalId = transacionExternalId;
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
