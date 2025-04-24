const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const gql = require('graphql-tag');
const cors = require('cors');
const { json } = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const transactionGrpcClient = require('./clients/transaction-grpc-client');

dotenv.config();

const QUERY_SERVICE_URL =
  process.env.TRANSACTION_QUERY_SERVICE_URL || 'http://localhost:3001';

const typeDefs = gql`
  type TransactionType {
    id: String!
    name: String!
  }

  type TransactionStatus {
    id: String!
    name: String!
  }

  type Transaction {
    transactionExternalId: String!
    accountExternalIdDebit: String!
    accountExternalIdCredit: String!
    transactionType: TransactionType!
    transactionStatus: TransactionStatus!
    value: Float!
    createdAt: String!
  }

  type TransactionList {
    transactions: [Transaction!]!
  }

  input CreateTransactionInput {
    accountExternalIdDebit: String!
    accountExternalIdCredit: String!
    transferTypeId: Int
    value: Float!
  }

  type CreateTransactionResponse {
    transactionExternalId: String!
    message: String!
  }

  type Query {
    getTransaction(transactionExternalId: String!): Transaction
    listTransactions: TransactionList!
  }

  type Mutation {
    createTransaction(
      input: CreateTransactionInput!
    ): CreateTransactionResponse!
  }
`;

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
          transactions: transactions.map((transaction) => {
            return {
              ...transaction,
              transactionType: {
                id: transaction.transactionTypeId,
                name: transaction.transactionTypeName,
              },
              transactionStatus: {
                id: transaction.transactionStatusId,
                name: transaction.transactionStatusName,
              },
            };
          }),
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
        // Use the gRPC client to create a transaction
        return await transactionGrpcClient.createTransaction(input);
      } catch (error) {
        console.error('Error creating transaction:', error);
        throw new Error(error.message || 'Failed to create transaction');
      }
    },
  },
};

async function startServer() {
  // Create Express app
  const app = express();

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        path: error.path,
        extensions: error.extensions,
      };
    },
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware
  app.use(cors());
  app.use(json());

  // Apply Apollo middleware to /graphql endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        return {
          authorization: req.headers.authorization,
        };
      },
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('Gateway is healthy');
  });

  // Start server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Gateway running at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
