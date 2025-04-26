import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../create-transaction.command';
import { TransactionCreatedEvent } from '../../../domain/events/transaction-created.event';
import { v4 as uuidv4 } from 'uuid';
import { EventTypeEnum } from '../../enums/event-type.enum';
import { EventStoreDBEventStoreService } from '../../../infrastructure/persistence/event-store/eventstoredb-event-store.service';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  constructor(private readonly eventStore: EventStoreDBEventStoreService) {}

  async execute(
    command: CreateTransactionCommand
  ): Promise<{ transactionId: string }> {
    const {
      accountExternalIdDebit,
      accountExternalIdCredit,
      transferTypeId,
      value,
    } = command;

    // Generate a unique transaction ID
    const transactionId = uuidv4();

    // Create the event
    const event = new TransactionCreatedEvent(
      transactionId,
      accountExternalIdDebit,
      accountExternalIdCredit,
      transferTypeId,
      value
    );

    // Save the event to the event store
    await this.eventStore.saveEvent({
      aggregateId: transactionId,
      eventData: event,
      eventType: EventTypeEnum.TRANSACTION_CREATED,
      timestamp: new Date().toISOString(),
    });

    return { transactionId };
  }
}
