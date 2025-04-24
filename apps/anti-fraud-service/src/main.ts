import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AntiFraudModule } from './anti-fraud.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const microservice =
      await NestFactory.createMicroservice<MicroserviceOptions>(
        AntiFraudModule,
        {
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: process.env.KAFKA_CLIENT_ID || 'anti-fraud--service',
              brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
            },
            consumer: {
              groupId: process.env.KAFKA_GROUP_ID || 'anti-fraud-group',
              allowAutoTopicCreation: true,
            },
            subscribe: {
              fromBeginning: true,
            },
          },
        }
      );

    logger.log('Starting microservice...');
    await microservice.listen();
    logger.log('🚀 Kafka consumer microservice is running');
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`, error.stack);
  }
}

bootstrap();
