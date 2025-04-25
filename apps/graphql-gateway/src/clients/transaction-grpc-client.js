const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const COMMAND_SERVICE_HOST =
  process.env.TRANSACTION_COMMAND_SERVICE_HOST || 'localhost';
const COMMAND_SERVICE_PORT =
  process.env.TRANSACTION_COMMAND_SERVICE_PORT || '5000';
const COMMAND_SERVICE_URL = `${COMMAND_SERVICE_HOST}:${COMMAND_SERVICE_PORT}`;

const PROTO_PATH = path.resolve(__dirname, '../protos/transaction.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const transactionProto =
  grpc.loadPackageDefinition(packageDefinition).transaction;

const client = new transactionProto.TransactionService(
  COMMAND_SERVICE_URL,
  grpc.credentials.createInsecure()
);

function createTransaction(input) {
  return new Promise((resolve, reject) => {
    const request = {
      accountExternalIdDebit: input.accountExternalIdDebit,
      accountExternalIdCredit: input.accountExternalIdCredit,
      transferTypeId: input.transferTypeId || 1,
      value: input.value,
    };

    console.log('Sending gRPC request:', request);

    client.createTransaction(request, (error, response) => {
      if (error) {
        console.error('gRPC Error:', error);
        return reject(error);
      }

      console.log('gRPC Response:', response);

      resolve({
        transactionExternalId: response.transactionId,
        message: 'Transaction created successfully',
      });
    });
  });
}

module.exports = {
  createTransaction,
};
