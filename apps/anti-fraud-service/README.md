# Anti-Fraud Service

## Overview

The Anti-Fraud Service is a microservice designed to evaluate transactions for potential fraud using Kafka for messaging. It processes transaction events and emits results based on predefined business rules.

## Features

- Kafka-based messaging for handling transaction events.
- Fraud evaluation based on transaction value.
- Health check endpoint for service status.

## Technologies Used

- NestJS: A progressive Node.js framework for building efficient and scalable server-side applications.
- Kafka: A distributed event streaming platform for high-throughput data pipelines.
- TypeScript: A superset of JavaScript that compiles to plain JavaScript.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- Kafka (running locally or accessible via a broker)
- Docker (optional, for running Kafka in a container)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables. Create a `.env` file in the root directory and add the following:

   ```env
   KAFKA_CLIENT_ID=your-client-id
   KAFKA_BROKER=localhost:9092
   KAFKA_GROUP_ID=your-group-id
   ```

### Running the Service

To start the service, go to the root folder and run:

```bash
nx serve anti-fraud-service
```

This will start the service in development mode.

### API Endpoints

- **Health Check**
  - **GET** `/health`
  - Returns the status of the service.

## Usage

To send a transaction event to the service, publish a message to the `transaction-created` topic in Kafka. The service will process the event and emit the fraud check result to the `fraud-check-result` topic.

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
