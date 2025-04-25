import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionController } from '../../src/presentation/grpc/transaction.controller';
import { CreateTransactionHandler } from '../../src/application/commands/handlers/create-transaction.handler';
import { MongoEventStoreService } from '../../src/infrastructure/persistence/event-store/mongo-event-store.service';
import { CreateTransactionDto } from '../../src/application/dtos/create-transaction.dto';
import { RpcException } from '@nestjs/microservices';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { validate } from 'class-validator';

describe('Transaction Creation Integration', () => {
  let module: TestingModule;
  let application: INestApplication;
  let controller: TransactionController;
  let eventStore: MongoEventStoreService;
  let kafkaClient: { emit: jest.Mock };
  let saveEventMock: jest.Mock;
  let emitMock: jest.Mock;

  beforeAll(async () => {
    saveEventMock = jest.fn().mockResolvedValue(undefined);
    emitMock = jest.fn().mockResolvedValue(undefined);

    module = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [TransactionController],
      providers: [
        CreateTransactionHandler,
        {
          provide: MongoEventStoreService,
          useValue: {
            saveEvent: saveEventMock,
          },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            emit: emitMock,
          },
        },
      ],
    }).compile();

    application = module.createNestApplication();
    application.useGlobalPipes(new ValidationPipe());

    await application.init();

    controller = application.get<TransactionController>(TransactionController);
    eventStore = application.get<MongoEventStoreService>(
      MongoEventStoreService
    );
    kafkaClient = application.get('KAFKA_SERVICE');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await application.close();
  });

  describe('createTransaction', () => {
    it('should successfully create a transaction and return a transaction ID', async () => {
      const dto = new CreateTransactionDto('debit-123', 'credit-456', 1, 1000);

      const result = await controller.createTransaction(dto);

      expect(result).toBeDefined();
      expect(result.transactionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should store the transaction event in the event store', async () => {
      const dto = new CreateTransactionDto('debit-123', 'credit-456', 1, 1000);

      const result = await controller.createTransaction(dto);

      expect(saveEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: expect.any(String),
          eventData: expect.objectContaining({
            accountExternalIdDebit: dto.accountExternalIdDebit,
            accountExternalIdCredit: dto.accountExternalIdCredit,
            transferTypeId: dto.transferTypeId,
            value: dto.value,
            transactionId: result.transactionId,
            timestamp: expect.any(Date),
          }),
          eventType: 1, // Changed from 'TRANSACTION_CREATED' to 1
          timestamp: expect.any(String),
        })
      );
    });

    it('should emit a transaction-created event to Kafka', async () => {
      const dto = new CreateTransactionDto('debit-123', 'credit-456', 1, 1000);

      const result = await controller.createTransaction(dto);

      expect(kafkaClient.emit).toHaveBeenCalledTimes(1);
      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'transaction-created',
        expect.objectContaining({
          key: result.transactionId,
          value: expect.any(String),
        })
      );

      const emittedValue = JSON.parse(kafkaClient.emit.mock.calls[0][1].value);
      expect(emittedValue).toEqual(
        expect.objectContaining({
          transactionId: result.transactionId,
          accountExternalIdDebit: dto.accountExternalIdDebit,
          accountExternalIdCredit: dto.accountExternalIdCredit,
          transferTypeId: dto.transferTypeId,
          value: dto.value,
          timestamp: expect.any(Number),
        })
      );
    });

    it('should handle event store failures gracefully', async () => {
      const dto = new CreateTransactionDto('debit-123', 'credit-456', 1, 1000);
      jest
        .spyOn(eventStore, 'saveEvent')
        .mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(controller.createTransaction(dto)).rejects.toThrow(
        RpcException
      );
    });
  });

  describe('CreateTransactionDto Validation', () => {
    it('should fail validation with empty values', async () => {
      const invalidDto = new CreateTransactionDto('', '', 0, -1000);
      const errors = await validate(invalidDto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map((error) => error.property)).toEqual(
        expect.arrayContaining([
          'accountExternalIdDebit',
          'accountExternalIdCredit',
          'value',
        ])
      );
    });

    it('should fail validation with negative value', async () => {
      const invalidDto = new CreateTransactionDto(
        'debit-123',
        'credit-456',
        1,
        -1000
      );
      const errors = await validate(invalidDto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should pass validation with valid data', async () => {
      const validDto = new CreateTransactionDto(
        'debit-123',
        'credit-456',
        1,
        1000
      );
      const errors = await validate(validDto);

      expect(errors.length).toBe(0);
    });
  });
});
