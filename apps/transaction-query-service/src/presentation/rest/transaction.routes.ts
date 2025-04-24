import { Routes } from '@nestjs/core';
import { TransactionQueryModule } from '../../transaction-query.module';

export const transactionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'transactions',
        module: TransactionQueryModule,
      },
    ],
  },
];
