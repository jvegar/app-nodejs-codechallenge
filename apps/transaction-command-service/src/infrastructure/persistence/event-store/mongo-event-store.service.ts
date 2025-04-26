import { Injectable } from '@nestjs/common';
import { EventStorePort } from '../../../domain/ports/event-store.port';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../../../domain/schemas/event.schema';
import { EventDto } from '../../../application/dtos/event.dto';

@Injectable()
export class MongoEventStoreService implements EventStorePort {
  constructor(
    @InjectModel('Event')
    private readonly eventModel: Model<Event>
  ) {}

  async saveEvent(event: EventDto): Promise<void> {
    try {
      await this.eventModel.create(event);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  }
}
