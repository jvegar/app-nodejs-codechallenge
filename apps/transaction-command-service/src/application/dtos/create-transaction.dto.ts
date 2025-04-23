import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  accountExternalIdDebit: string;
  @IsString()
  @IsNotEmpty()
  accountExternalIdCredit: string;
  @IsNumber()
  @IsNotEmpty()
  transferTypeId: number;
  @IsNumber()
  @IsNotEmpty()
  value: number;

  constructor(
    accountExternalIdDebit: string,
    accountExternalIdCredit: string,
    transferTypeId: number,
    value: number
  ) {
    this.accountExternalIdDebit = accountExternalIdDebit;
    this.accountExternalIdCredit = accountExternalIdCredit;
    this.transferTypeId = transferTypeId;
    this.value = value;
  }
}
