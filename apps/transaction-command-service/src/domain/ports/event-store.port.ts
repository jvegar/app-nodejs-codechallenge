import { TransactionCreatedEvent } from '../events/transaction-created.event';

export interface EventStorePort {
  saveEvent(event: TransactionCreatedEvent): Promise<void>;
}
