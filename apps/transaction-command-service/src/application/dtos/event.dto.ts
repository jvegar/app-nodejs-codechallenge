import { CreateTransactionDto } from './create-transaction.dto';

export class EventDto {
  readonly aggregateId: string;
  readonly eventType: number;
  readonly eventData: CreateTransactionDto;
  readonly timestamp: string;
}
