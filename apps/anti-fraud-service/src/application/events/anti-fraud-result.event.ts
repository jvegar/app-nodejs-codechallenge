export class AntiFraudResultEvent {
  constructor(
    public readonly transactionId: string,
    public readonly value: number,
    public readonly timestamp: number | Date,
    public readonly transactionStatusId: number
  ) {}
}
