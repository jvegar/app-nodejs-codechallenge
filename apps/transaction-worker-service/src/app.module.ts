import { Module } from '@nestjs/common';
import { EventForwarderProcessor } from './event-forwarder/event-forwarder.processor';
import { EventSubscriberService } from './event-subscriber/event-subscriber.service';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [EventForwarderProcessor, EventSubscriberService],
})
export class AppModule {}