# GraphQL Gateway for Transaction Services

This gateway provides a unified GraphQL API that:

1. Queries the read model via REST (transaction-query-service)
2. Creates transaction events via gRPC (transaction-command-service)

## Architecture

The gateway consists of:

- **GraphQL Server**: Exposes a unified API for transaction operations
- **REST Client**: Connects to the transaction-query-service
- **gRPC Client**: Connects to the transaction-command-service

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Configure environment variables:

   - Copy `.env.example` to `.env`
   - Adjust service URLs if needed:
     - REST Query Service: `TRANSACTION_QUERY_SERVICE_URL`
     - gRPC Command Service: `TRANSACTION_COMMAND_SERVICE_HOST` and `TRANSACTION_COMMAND_SERVICE_PORT`

3. Start the gateway:

   ```
   ./basic-gateway.sh
   ```

4. The gateway will be available at:
   - GraphQL Endpoint: http://localhost:4000/graphql
   - Health Check: http://localhost:4000/health

## Example Queries

### Query Transactions

```graphql
query GetTransaction {
  getTransaction(transactionExternalId: "tx-123") {
    transactionExternalId
    accountExternalIdDebit
    accountExternalIdCredit
    value
    createdAt
  }
}

query ListTransactions {
  listTransactions {
    transactions {
      transactionExternalId
      value
      createdAt
    }
  }
}
```

### Create Transaction (via gRPC)

```graphql
mutation CreateTransaction {
  createTransaction(
    input: {
      accountExternalIdDebit: "acc-123"
      accountExternalIdCredit: "acc-456"
      transferTypeId: 1
      value: 100.50
    }
  ) {
    transactionExternalId
    message
  }
}
```

## Dependencies

Make sure both transaction services are running:

- transaction-command-service (gRPC: default localhost:5000)
- transaction-query-service (REST: default localhost:3001)
