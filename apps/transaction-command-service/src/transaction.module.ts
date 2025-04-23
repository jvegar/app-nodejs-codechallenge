import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoEventStoreService } from './infraestructure/event-store/mongo-event-store.service';
import { TransactionController } from './presentation/grpc/transaction.controller';
import { CreateTransactionHandler } from './application/commands/handlers/create-transaction.handler';

@Module({
  imports: [CqrsModule],
  controllers: [TransactionController],
  providers: [MongoEventStoreService, CreateTransactionHandler],
})
export class TransactionModule {}
