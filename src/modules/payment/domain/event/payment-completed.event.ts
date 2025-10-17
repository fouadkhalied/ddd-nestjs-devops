import { IEvent } from '@nestjs/cqrs';
import { Payment } from '../entity/payment.entity';

export class PaymentCompletedEvent implements IEvent {
  constructor(public readonly payment: Payment) {}
}