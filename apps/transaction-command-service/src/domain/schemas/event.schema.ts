import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

interface EventData {
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transferTypeId: number;
  value: number;
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  aggregateId: string;

  @Prop({ required: true })
  eventType: number;

  @Prop({
    required: true,
    type: {
      accountExternalIdDebit: String,
      accountExternalIdCredit: String,
      transferTypeId: Number,
      value: Number,
    }
  })
  eventData: EventData;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
