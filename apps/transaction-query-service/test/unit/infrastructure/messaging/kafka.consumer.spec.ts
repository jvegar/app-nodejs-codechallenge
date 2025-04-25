import { Test, TestingModule } from '@nestjs/testing';
import { KafkaConsumerService } from '../../../../src/infrastructure/messaging/kafka.consumer.service';
import { TransactionReadRepository } from '../../../../src/infrastructure/persistence/transaction-read.repository';

describe('KafkaConsumerService', () => {
  let service: KafkaConsumerService;
  let repository: TransactionReadRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaConsumerService,
        {
          provide: 'TRANSACTION_READ_REPOSITORY',
          useValue: {
            save: jest.fn().mockResolvedValue(undefined),
            updateStatus: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<KafkaConsumerService>(KafkaConsumerService);
    repository = module.get('TRANSACTION_READ_REPOSITORY');
  });

  describe('handleTransactionCreated', () => {
    it('should save transaction when receiving transaction-created event', async () => {
      const payload = {
        transactionId: 'test-123',
        accountExternalIdDebit: 'debit-123',
        accountExternalIdCredit: 'credit-456',
        transferTypeId: 1,
        value: 1000,
        timestamp: Date.now(),
      };

      await service.handleTransactionCreated(payload);

      expect(repository.save).toHaveBeenCalled();
    });
  });
});
