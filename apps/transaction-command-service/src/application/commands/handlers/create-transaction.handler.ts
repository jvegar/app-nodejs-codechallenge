import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../create-transaction.command';
import { MongoEventStoreService } from '../../../infraestructure/event-store/mongo-event-store.service';
import { TransactionCreatedEvent } from '../../../domain/events/transaction-created.event';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  constructor(private readonly eventStore: MongoEventStoreService) {}

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
    await this.eventStore.saveEvent(event);

    return { transactionId };
  }
}
