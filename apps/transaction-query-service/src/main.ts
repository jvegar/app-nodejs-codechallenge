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
  // Create hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(TransactionQueryModule);
  app.useGlobalPipes(new ValidationPipe());

  // Configure and connect the Kafka microservice
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID || 'transaction-query-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID || 'transaction-query-group',
        allowAutoTopicCreation: true,
        // Start consuming from the earliest message if no offset is found
        readUncommitted: false,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  };

  app.connectMicroservice(microserviceOptions);

  // Start the microservice and HTTP server
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);

  Logger.log(
    `🚀 REST API is running on: http://localhost:${process.env.PORT || 3001}`
  );
  Logger.log(`🚀 Kafka consumer is listening for transaction events`);
}

bootstrap();
