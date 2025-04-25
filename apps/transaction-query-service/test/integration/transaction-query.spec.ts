import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { INestApplication } from '@nestjs/common';
import { TransactionController } from '../../src/presentation/rest/transaction.controller';
import { TransactionReadRepository } from '../../src/infrastructure/persistence/transaction-read.repository';
import { GetTransactionHandler } from '../../src/application/queries/handlers/get-transaction.handler';
import { ListTransactionsHandler } from '../../src/application/queries/handlers/list-transactions.handler';

describe('Transaction Query Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let controller: TransactionController;
  let repository: TransactionReadRepository;

  beforeAll(async () => {
    const mockRepository = {
      findById: jest.fn().mockResolvedValue({
        transactionExternalId: 'test-123',
        accountExternalIdDebit: 'debit-123',
        accountExternalIdCredit: 'credit-456',
        transactionTypeId: 1,
        transactionTypeName: 'PEER_TO_PEER',
        transactionStatusId: 1,
        transactionStatusName: 'CREATED',
        value: 1000,
        createdAt: new Date(),
      }),
      findAll: jest.fn().mockResolvedValue([
        {
          transactionExternalId: 'test-123',
          accountExternalIdDebit: 'debit-123',
          accountExternalIdCredit: 'credit-456',
          transactionTypeId: 1,
          transactionTypeName: 'PEER_TO_PEER',
          transactionStatusId: 1,
          transactionStatusName: 'CREATED',
          value: 1000,
          createdAt: new Date(),
        },
      ]),
    };

    module = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [TransactionController],
      providers: [
        GetTransactionHandler,
        ListTransactionsHandler,
        {
          provide: 'TRANSACTION_READ_REPOSITORY',
          useValue: mockRepository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<TransactionController>(TransactionController);
    repository = module.get('TRANSACTION_READ_REPOSITORY');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('getTransactionById', () => {
    it('should return a transaction by id', async () => {
      const transactionId = 'test-123';
      const result = await controller.getTransactionById(transactionId);

      expect(result).toBeDefined();
      expect(repository.findById).toHaveBeenCalledWith(transactionId);
    });
  });

  describe('list', () => {
    it('should return all transactions', async () => {
      const result = await controller.list();

      expect(result).toBeDefined();
      expect(repository.findAll).toHaveBeenCalled();
      expect(Array.isArray(result.transactions)).toBe(true);
    });
  });
});