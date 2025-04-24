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
            clientId: 'transaction-command',
            brokers: ['localhost:9092'], // Update with your Kafka broker address
          },
          consumer: {
            groupId: 'transaction-command-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [TransactionController],
  providers: [MongoEventStoreService, CreateTransactionHandler],
})
export class TransactionModule {}
