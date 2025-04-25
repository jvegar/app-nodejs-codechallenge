const gql = require('graphql-tag');

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
    createTransaction(input: CreateTransactionInput!): CreateTransactionResponse!
  }
`;

module.exports = typeDefs;