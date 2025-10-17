import { IEvent } from '@nestjs/cqrs';
import { Payment } from '../entity/payment.entity';

export class PaymentCreatedEvent implements IEvent {
  constructor(
    public readonly payment: Payment,
    public readonly correlationId?: string,
  ) {}
}