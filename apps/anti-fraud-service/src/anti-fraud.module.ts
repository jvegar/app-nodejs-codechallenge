import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaConsumerService } from './infrastructure/messaging/kafka.consumer.service';
import { KafkaProducerService } from './infrastructure/messaging/kafka.producer.service';
import { FraudCheckService } from './application/services/fraud-check.service';
import { HealthController } from './presentation/rest/health.controller';
import { TransactionCreatedHandler } from './application/events/handlers/transaction-created.handler';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        useFactory: () => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: process.env.KAFKA_CLIENT_ID || 'anti-fraud-service',
              brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
            },
            consumer: {
              groupId: process.env.KAFKA_GROUP_ID || 'anti-fraud-group',
              allowAutoTopicCreation: true,
            },
            subscribe: {
              topics: ['transaction-created'],
              fromBeginning: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [HealthController, KafkaConsumerService],
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
})
export class AntiFraudModule {}
