# Transaction Query Service

## Overview

The Transaction Query Service is a microservice designed to handle queries related to transactions. It provides endpoints to retrieve transaction details and lists of transactions using Kafka for messaging and CockroachDB for data persistence.

## Features

- Query transactions by ID.
- List all transactions.
- Kafka-based messaging for handling transaction events.
- CockroachDB for reliable data storage.

## Technologies Used

- NestJS: A progressive Node.js framework for building efficient and scalable server-side applications.
- Kafka: A distributed event streaming platform for high-throughput data pipelines.
- CockroachDB: A distributed SQL database for cloud applications.
- TypeScript: A superset of JavaScript that compiles to plain JavaScript.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- Kafka (running locally or accessible via a broker)
- CockroachDB (running locally or accessible)
- Docker (optional, for running Kafka and CockroachDB in containers)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables. Create a `.env` file in the root directory and add the following:

   ```env
   # CockroachDB Configuration
   COCKROACH_HOST=localhost
   COCKROACH_PORT=26257
   COCKROACH_USER=root
   COCKROACH_PASSWORD=
   COCKROACH_DB=transaction

   # Kafka Configuration
   KAFKA_BROKER=localhost:9092
   KAFKA_CLIENT_ID=transaction-query-service
   KAFKA_GROUP_ID=transaction-query-group

   # Application Configuration
   PORT=3001
   ```

### Running the Service

To start the service, go to the root and run:

```bash
nx serve transaction-query-service
```

This will start the service in development mode.

### API Endpoints

- **Get Transaction by ID**

  - **GET** `/transactions/:id`
  - Retrieves a transaction by its external ID.

- **List Transactions**
  - **GET** `/transactions`
  - Retrieves a list of all transactions.

## Usage

To send a transaction event to the service, publish a message to the `transaction-created` topic in Kafka. The service will process the event and store the transaction in CockroachDB.

### Example Transaction Event

```json
{
  "transactionId": "12345",
  "accountExternalIdDebit": "account1",
  "accountExternalIdCredit": "account2",
  "transferTypeId": 1,
  "value": 1500,
  "timestamp": "2023-01-01T00:00:00Z"
}
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
