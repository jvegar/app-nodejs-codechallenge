import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionHandler } from '../../../../src/application/commands/handlers/create-transaction.handler';
import { CreateTransactionCommand } from '../../../../src/application/commands/create-transaction.command';
import { MongoEventStoreService } from '../../../../src/infrastructure/persistence/event-store/mongo-event-store.service';
import { TransactionCreatedEvent } from '../../../../src/domain/events/transaction-created.event';
import { EventTypeEnum } from '../../../../src/application/enums/event-type.enum';

describe('CreateTransactionHandler', () => {
  let handler: CreateTransactionHandler;
  let eventStore: jest.Mocked<MongoEventStoreService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionHandler,
        {
          provide: MongoEventStoreService,
          useValue: {
            saveEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateTransactionHandler>(CreateTransactionHandler);
    eventStore = module.get(MongoEventStoreService);
  });

  describe('execute', () => {
    it('should create a transaction and return a transaction ID', async () => {
      const command = new CreateTransactionCommand(
        'debit-123',
        'credit-456',
        1,
        1000
      );

      const result = await handler.execute(command);

      expect(result).toHaveProperty('transactionId');
      expect(typeof result.transactionId).toBe('string');
      expect(result.transactionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should save the transaction created event to the event store', async () => {
      const command = new CreateTransactionCommand(
        'debit-123',
        'credit-456',
        1,
        1000
      );

      const result = await handler.execute(command);

      expect(eventStore.saveEvent).toHaveBeenCalledTimes(1);
      expect(eventStore.saveEvent).toHaveBeenCalledWith({
        aggregateId: result.transactionId,
        eventData: expect.any(TransactionCreatedEvent),
        eventType: EventTypeEnum.TRANSACTION_CREATED,
        timestamp: expect.any(String),
      });

      const savedEvent = eventStore.saveEvent.mock.calls[0][0];
      expect(savedEvent.eventData).toEqual(
        expect.objectContaining({
          transactionId: result.transactionId,
          accountExternalIdDebit: command.accountExternalIdDebit,
          accountExternalIdCredit: command.accountExternalIdCredit,
          transferTypeId: command.transferTypeId,
          value: command.value,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should throw an error when event store fails', async () => {
      const command = new CreateTransactionCommand(
        'debit-123',
        'credit-456',
        1,
        1000
      );

      const error = new Error('Failed to save event');
      eventStore.saveEvent.mockRejectedValueOnce(error);

      await expect(handler.execute(command)).rejects.toThrow(error);
    });
  });
});