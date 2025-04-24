import { Test, TestingModule } from '@nestjs/testing';
import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaConsumerService } from '../../src/infrastructure/messaging/kafka.consumer.service';
import { KafkaProducerService } from '../../src/infrastructure/messaging/kafka.producer.service';
import { FraudCheckService } from '../../src/application/services/fraud-check.service';
import { TransactionCreatedHandler } from '../../src/application/events/handlers/transaction-created.handler';

describe('KafkaConsumerService Integration', () => {
  let app: TestingModule;
  let kafkaConsumerService: KafkaConsumerService;
  let clientKafka: ClientKafka;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: 'KAFKA_SERVICE',
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'test-client',
                brokers: ['localhost:9092'],
              },
              consumer: {
                groupId: 'test-group',
              },
            },
          },
        ]),
      ],
      providers: [
        KafkaConsumerService,
        KafkaProducerService,
        FraudCheckService,
        TransactionCreatedHandler,
        {
          provide: 'KAFKA_PRODUCER_PORT',
          useExisting: KafkaProducerService,
        },
      ],
    }).compile();

    kafkaConsumerService = app.get<KafkaConsumerService>(KafkaConsumerService);
    clientKafka = app.get<ClientKafka>('KAFKA_SERVICE');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should process transaction events', async () => {
    // Implementation will depend on your specific requirements
    expect(kafkaConsumerService).toBeDefined();
  });
});