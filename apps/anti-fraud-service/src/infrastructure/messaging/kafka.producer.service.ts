import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaProducerPort } from '../../domain/ports/kafka-producer.port';
import { AntiFraudResultEvent } from '../../application/events/anti-fraud-result.event';

@Injectable()
export class KafkaProducerService implements KafkaProducerPort, OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {
    this.logger.log('KafkaProducerService instantiated');
  }

  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      this.logger.log('Kafka producer client connected successfully');
    } catch (error) {
      this.logger.error(
        `Failed to connect Kafka producer client: ${error.message}`,
        error.stack
      );
    }
  }

  async emit(topic: string, event: AntiFraudResultEvent): Promise<void> {
    try {
      this.logger.debug(
        `Emitting event to topic ${topic}: ${JSON.stringify(event)}`
      );
      await this.kafkaClient.emit(topic, {
        key: event.transactionId,
        value: JSON.stringify(event),
      });
      this.logger.log(`Event emitted to topic ${topic}`);
    } catch (error) {
      this.logger.error(
        `Failed to emit event to Kafka topic ${topic}: ${error.message}`,
        error.stack
      );
    }
  }
}
