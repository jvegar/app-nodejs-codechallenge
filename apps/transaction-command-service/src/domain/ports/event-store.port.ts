import { TransactionCreatedEvent } from '../events/transacion-created.event';

export interface EventStorePort {
  saveEvent(event: TransactionCreatedEvent): Promise<void>;
}
