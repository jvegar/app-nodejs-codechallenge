import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoEventStoreService } from './infraestructure/event-store/mongo-event-store.service';
import { TransactionController } from './presentation/grpc/transaction.controller';
import { CreateTransactionHandler } from './application/commands/handlers/create-transaction.handler';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: process.env.KAFKA_CLIENT_ID || 'transaction-command',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId:
              process.env.KAFKA_GROUP_ID || 'transaction-command-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [TransactionController],
  providers: [MongoEventStoreService, CreateTransactionHandler],
})
export class TransactionModule {}
