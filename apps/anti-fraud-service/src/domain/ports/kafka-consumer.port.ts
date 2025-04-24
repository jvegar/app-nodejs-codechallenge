export interface KafkaConsumerPort {
  handleTransactionCreated(event: any): Promise<void>;
}
