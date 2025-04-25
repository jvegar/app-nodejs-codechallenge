import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { ClientKafka } from '@nestjs/microservices';
import { TransactionController } from '../../../../src/presentation/grpc/transaction.controller';
import { CreateTransactionDto } from '../../../../src/application/dtos/create-transaction.dto';

describe('TransactionController', () => {
  let controller: TransactionController;
  let commandBus: CommandBus;
  let kafkaClient: ClientKafka;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn().mockResolvedValue({ transactionId: 'test-123' }),
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

    controller = module.get<TransactionController>(TransactionController);
    commandBus = module.get<CommandBus>(CommandBus);
    kafkaClient = module.get<ClientKafka>('KAFKA_SERVICE');
  });

  describe('createTransaction', () => {
    it('should create transaction and emit event', async () => {
      const dto = new CreateTransactionDto(
        'debit-123',
        'credit-456',
        1,
        1000
      );

      const result = await controller.createTransaction(dto);

      expect(result).toEqual({ transactionId: 'test-123' });
      expect(commandBus.execute).toHaveBeenCalled();
      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'transaction-created',
        expect.any(Object)
      );
    });

    it('should handle errors properly', async () => {
      const dto = new CreateTransactionDto(
        'debit-123',
        'credit-456',
        1,
        1000
      );

      jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Test error'));

      await expect(controller.createTransaction(dto)).rejects.toThrow();
    });
  });
});