import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { RouterModule } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { cockroachConfig } from './infrastructure/persistence/cokroach.config';
import { TransactionReadEntity } from './infrastructure/persistence/transaction-read.entity';
import { TransactionReadRepository } from './infrastructure/persistence/transaction-read.repository';
import { KafkaConsumerService } from './infrastructure/messaging/kafka.consumer.service';
import { TransactionController } from './presentation/rest/transaction.controller';
import { transactionRoutes } from './presentation/rest/transaction.routes';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forRoot(cockroachConfig),
    TypeOrmModule.forFeature([TransactionReadEntity]),
    RouterModule.register(transactionRoutes),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId:
              process.env.KAFKA_CLIENT_ID || 'transaction-query-service',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: process.env.KAFKA_GROUP_ID || 'transaction-query-group',
          },
        },
      },
    ]),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionReadRepository,
    KafkaConsumerService,
    {
      provide: 'TRANSACTION_READ_REPOSITORY',
      useExisting: TransactionReadRepository,
    },
  ],
})
export class TransactionQueryModule {}
