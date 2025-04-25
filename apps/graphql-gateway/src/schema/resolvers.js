const axios = require('axios');
const transactionGrpcClient = require('../clients/transaction-grpc-client');

const QUERY_SERVICE_URL = process.env.TRANSACTION_QUERY_SERVICE_URL || 'http://localhost:3001';

const resolvers = {
  Query: {
    getTransaction: async (_, { transactionExternalId }) => {
      try {
        const response = await axios.get(
          `${QUERY_SERVICE_URL}/transactions/${transactionExternalId}`
        );
        const transaction = response.data;
        return {
          ...transaction,
          transactionType: {
            id: transaction.transactionTypeId,
            name: transaction.transactionTypename,
          },
          transactionStatus: {
            id: transaction.transactionStatusId,
            name: transaction.transactionStatusName,
          },
        };
      } catch (error) {
        console.error('Error fetching transaction:', error);
        return null;
      }
    },
    listTransactions: async () => {
      try {
        const response = await axios.get(`${QUERY_SERVICE_URL}/transactions`);
        const { transactions } = response.data;
        return {
          transactions: transactions.map((transaction) => ({
            ...transaction,
            transactionType: {
              id: transaction.transactionTypeId,
              name: transaction.transactionTypeName,
            },
            transactionStatus: {
              id: transaction.transactionStatusId,
              name: transaction.transactionStatusName,
            },
          })),
        };
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return { transactions: [] };
      }
    },
  },
  Mutation: {
    createTransaction: async (_, { input }) => {
      try {
        return await transactionGrpcClient.createTransaction(input);
      } catch (error) {
        console.error('Error creating transaction:', error);
        throw new Error(error.message || 'Failed to create transaction');
      }
    },
  },
};

module.exports = resolvers;