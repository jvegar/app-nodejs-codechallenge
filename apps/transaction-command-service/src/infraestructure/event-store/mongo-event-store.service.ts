import { Injectable } from '@nestjs/common';
import { EventStorePort } from '../../domain/ports/event-store.port';
import { MongoClient, Collection } from 'mongodb';
import { TransactionCreatedEvent } from '../../domain/events/transacion-created.event';

@Injectable()
export class MongoEventStoreService implements EventStorePort {
  private client: MongoClient;
  private collection: Collection;

  constructor() {
    this.client = new MongoClient(
      process.env.MONGO_URI || 'mongodb://localhost:27017'
    );
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
