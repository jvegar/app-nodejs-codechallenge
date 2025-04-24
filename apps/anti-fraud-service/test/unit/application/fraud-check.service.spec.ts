import { Test, TestingModule } from '@nestjs/testing';
import { FraudCheckService } from '../../../src/application/services/fraud-check.service';
import { TransactionStatusEnum } from '../../../src/domain/enums/transaction-status.enum';
import { TRANSACTION_MAX_VALUE } from '../../../src/domain/constants/anti-fraud.constants';

describe('FraudCheckService', () => {
  let service: FraudCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FraudCheckService],
    }).compile();

    service = module.get<FraudCheckService>(FraudCheckService);
  });

  describe('evaluate', () => {
    it('should approve transaction when value is below threshold', async () => {
      const transaction = {
        transactionExternalId: '123',
        value: TRANSACTION_MAX_VALUE - 100,
      };

      const result = await service.evaluate(transaction);

      expect(result.transactionStatusId).toBe(TransactionStatusEnum.APPROVED);
    });

    it('should reject transaction when value is above threshold', async () => {
      const transaction = {
        transactionExternalId: '123',
        value: TRANSACTION_MAX_VALUE + 100,
      };

      const result = await service.evaluate(transaction);

      expect(result.transactionStatusId).toBe(TransactionStatusEnum.REJECTED);
    });
  });
});