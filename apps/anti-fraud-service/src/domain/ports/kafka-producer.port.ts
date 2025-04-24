export interface KafkaProducerPort {
  emit(topic: string, event: any): Promise<void>;
}
