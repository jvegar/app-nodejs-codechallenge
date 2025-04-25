import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TransactionReadEntity } from './transaction-read.entity';

export const cockroachConfig: TypeOrmModuleOptions = {
  type: 'cockroachdb',
  host: process.env.COCKROACH_HOST || 'localhost',
  port: parseInt(process.env.COCKROACH_PORT, 10) || 26257,
  username: process.env.COCKROACH_USER || 'root',
  password: process.env.COCKROACH_PASSWORD || '',
  database: process.env.COCKROACH_DB || 'transaction',
  entities: [TransactionReadEntity],
  synchronize: true,
  ssl: false,
};
