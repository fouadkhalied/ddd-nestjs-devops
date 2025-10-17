import { IEvent } from '@nestjs/cqrs';
import { Payment } from '../entity/payment.entity';

export class PaymentFailedEvent implements IEvent {
  constructor(
    public readonly payment: Payment,
    public readonly reason?: string,
  ) {}
}