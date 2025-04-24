import { EventDto } from '../../application/dtos/event.dto';

export interface EventStorePort {
  saveEvent(event: EventDto): Promise<void>;
}
