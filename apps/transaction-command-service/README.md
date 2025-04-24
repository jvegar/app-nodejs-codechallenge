# Transaction Command Service

## Overview

The Transaction Command Service is a microservice designed to handle commands related to transactions. It provides a gRPC interface for creating transactions and emits events to Kafka for further processing. This service uses MongoDB for event storage.

## Features

- Create transactions via gRPC.
- Emit transaction-created events to Kafka.
- MongoDB for reliable event storage.

## Technologies Used

- NestJS: A progressive Node.js framework for building efficient and scalable server-side applications.
- gRPC: A high-performance RPC framework for communication between services.
- Kafka: A distributed event streaming platform for high-throughput data pipelines.
- MongoDB: A NoSQL database for storing event data.
- TypeScript: A superset of JavaScript that compiles to plain JavaScript.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB (running locally or accessible)
- Kafka (running locally or accessible via a broker)
- Docker (optional, for running MongoDB and Kafka in containers)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables. Create a `.env` file in the root directory and add the following:

   ```env
   MONGO_URI=mongodb://root:example@localhost:27017
   NODE_ENV=development

   # Kafka Configuration
   KAFKA_BROKER=localhost:9092
   KAFKA_CLIENT_ID=transaction-command
   KAFKA_GROUP_ID=transaction-command-consumer
   ```

### Running the Service

To start the service, go to the root folder and run:

```bash
nx serve transaction-commmand-service
```

This will start the service in development mode.

### gRPC API Endpoints

- **Create Transaction**
  - **RPC** `CreateTransaction(CreateRequest) returns (CreateResponse)`
  - Creates a new transaction and emits a `transaction-created` event to Kafka.

#### Example gRPC Request

```protobuf
message CreateRequest {
    string accountExternalIdDebit = 1;
    string accountExternalIdCredit = 2;
    int32 transferTypeId = 3;
    double value = 4;
}
```

#### Example gRPC Response

```protobuf
message CreateResponse {
    string transactionId = 1;
}
```

### Usage

To create a transaction, send a gRPC request to the `TransactionService` with the required fields. The service will process the command and emit the transaction-created event to Kafka.

### Example Transaction Creation Request

```bash
grpcurl -plaintext -d '{
  "accountExternalIdDebit": "account1",
  "accountExternalIdCredit": "account2",
  "transferTypeId": 1,
  "value": 1500
}' localhost:5000 transaction.TransactionService/CreateTransaction
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
