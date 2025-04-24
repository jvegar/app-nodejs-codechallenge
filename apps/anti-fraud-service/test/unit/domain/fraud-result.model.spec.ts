import { FraudResult } from '../../../src/domain/models/fraud-result.model';
import { TransactionStatusEnum } from '../../../src/domain/enums/transaction-status.enum';

describe('FraudResult', () => {
  it('should create a valid fraud result instance', () => {
    const timestamp = new Date();
    const fraudResult = new FraudResult(
      '123',
      1000,
      timestamp,
      TransactionStatusEnum.APPROVED
    );

    expect(fraudResult.transactionId).toBe('123');
    expect(fraudResult.value).toBe(1000);
    expect(fraudResult.timestamp).toBe(timestamp);
    expect(fraudResult.transactionStatusId).toBe(TransactionStatusEnum.APPROVED);
  });
});