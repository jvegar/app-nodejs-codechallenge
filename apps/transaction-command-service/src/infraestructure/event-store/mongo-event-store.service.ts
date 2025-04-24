import { Injectable } from '@nestjs/common';
import { EventStorePort } from '../../domain/ports/event-store.port';
import { MongoClient, Collection } from 'mongodb';
import { TransactionCreatedEvent } from '../../domain/events/transaction-created.event';

@Injectable()
export class MongoEventStoreService implements EventStorePort {
  private client: MongoClient;
  private collection: Collection;

  constructor() {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://root:example@localhost:27017';
    this.client = new MongoClient(mongoUri);
    this.client.connect().then(() => {
      this.collection = this.client.db('transaction').collection('events');
    });
  }

  async saveEvent(event: TransactionCreatedEvent): Promise<void> {
    await this.collection.insertOne({
      aggregateId: event.transactionId,
      eventType: 'TransactionCreated',
      eventData: event,
      timestamp: event.timestamp,
    });
  }
}
