import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TransactionModule } from './transaction.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { join } from 'path';
import { connect as connectToEventStore } from './infrastructure/persistence/event-store/eventstoredb.client';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TransactionModule,
    {
      transport: Transport.GRPC,
      options: {
        onLoadPackageDefinition: (pkg, server) => {
          new ReflectionService(pkg).addToServer(server);
        },
        package: 'transaction',
        protoPath: join(__dirname, 'presentation/grpc/proto/transaction.proto'),
        url: 'localhost:5000',
      },
    }
  );
  app.useGlobalPipes(new ValidationPipe());
  await connectToEventStore();
  await app.listen();
  Logger.log(`Transaction Command microservice is listening`);
}

bootstrap();
