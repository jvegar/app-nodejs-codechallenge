import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { TransactionController } from '../../../../src/presentation/rest/transaction.controller';
import { GetTransactionQuery } from '../../../../src/application/queries/get-transaction.query';
import { ListTransactionsQuery } from '../../../../src/application/queries/list-transactions.query';

describe('TransactionController', () => {
  let controller: TransactionController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn().mockResolvedValue({
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
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  describe('getTransactionById', () => {
    it('should return a transaction by id', async () => {
      const transactionId = 'test-123';
      const result = await controller.getTransactionById(transactionId);

      expect(result).toBeDefined();
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetTransactionQuery(transactionId)
      );
    });
  });

  describe('list', () => {
    it('should return a list of transactions', async () => {
      const result = await controller.list();

      expect(result).toBeDefined();
      expect(queryBus.execute).toHaveBeenCalledWith(
        new ListTransactionsQuery()
      );
    });
  });
});