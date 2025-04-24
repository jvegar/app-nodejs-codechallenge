import { Injectable } from '@nestjs/common';
import { FraudResult } from '../../domain/models/fraud-result.model';
import { TransactionStatusEnum } from '../../domain/enums/transaction-status.enum';
import { TRANSACTION_MAX_VALUE } from '../../domain/constants/anti-fraud.constants';

@Injectable()
export class FraudCheckService {
  async evaluate(transaction: any): Promise<FraudResult> {
    const isFraud = transaction.value > TRANSACTION_MAX_VALUE;
    const status = isFraud
      ? TransactionStatusEnum.REJECTED
      : TransactionStatusEnum.APPROVED;

    return new FraudResult(
      transaction.transactionExternalId,
      transaction.value,
      Date.now(),
      status
    );
  }
}
