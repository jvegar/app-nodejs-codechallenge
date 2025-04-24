export const kafkaConfig = {
  brokers: [process.env.KAFKA_BROKER],
  groupId: process.env.KAFKA_GROUP_ID,
  topics: {
    transaction: 'transaction-created',
    fraudChecked: 'transaction-fraud-checked',
  },
};
