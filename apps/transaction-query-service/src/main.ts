/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TransactionQueryModule } from './transaction-query.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    logger.log('Initializing application...');

    const microservice =
      await NestFactory.createMicroservice<MicroserviceOptions>(
        TransactionQueryModule,
        {
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId:
                process.env.KAFKA_CLIENT_ID || 'transaction-query-service',
              brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
            },
            consumer: {
              groupId: process.env.KAFKA_GROUP_ID || 'transaction-query-group',
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

    const app = await NestFactory.create(TransactionQueryModule);
    app.useGlobalPipes(new ValidationPipe());

    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 REST API is running on: http://localhost:${port}`);
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`, error.stack);
  }
}

bootstrap();
