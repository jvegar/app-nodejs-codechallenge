import { Injectable } from "@nestjs/common";
import { EventStoreDBClient, jsonEvent } from '@eventstore/db-client';
import { EventDto } from "apps/transaction-command-service/src/application/dtos/event.dto";
import { EventStorePort } from "apps/transaction-command-service/src/domain/ports/event-store.port";
import { EventTypeEnum } from "apps/transaction-command-service/src/application/enums/event-type.enum";

@Injectable()
export class EventStoreDBEventStoreService implements EventStorePort {
    constructor(
        private readonly eventStoreDB: EventStoreDBClient
    ) {}
    async saveEvent(event: EventDto): Promise<void> {
        try {
            await this.eventStoreDB.appendToStream(event.aggregateId, jsonEvent({type: EventTypeEnum[EventTypeEnum.TRANSACTION_CREATED], data: {...event} }));
        } catch (error) {
            console.error('Error saving event:', error);
        }
    }
}