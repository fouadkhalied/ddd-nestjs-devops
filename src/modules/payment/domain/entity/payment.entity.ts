import { AggregateRoot } from '@nestjs/cqrs';
import { PaymentStatus } from '../value-object/payment-status.enum';
import { PaymentMethod } from '../value-object/payment-method.enum';
import { PaymentCreatedEvent } from '../event/payment-created.event';
import { PaymentCompletedEvent } from '../event/payment-completed.event';
import { PaymentFailedEvent } from '../event/payment-failed.event';

export interface PaymentProps {
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  impressionsAllocated?: number;
  adsId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Payment extends AggregateRoot {
  id: string;
  props: PaymentProps;

  constructor(id: string, props: PaymentProps) {
    super();
    this.id = id;
    this.props = props;
  }

  create() {
    this.apply(new PaymentCreatedEvent(this));
  }

  complete() {
    if (this.props.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be completed');
    }
    this.props.status = PaymentStatus.COMPLETED;
    this.props.updatedAt = new Date();
    this.apply(new PaymentCompletedEvent(this));
  }

  fail(reason?: string) {
    if (this.props.status === PaymentStatus.COMPLETED) {
      throw new Error('Cannot fail a completed payment');
    }
    this.props.status = PaymentStatus.FAILED;
    this.props.updatedAt = new Date();
    this.apply(new PaymentFailedEvent(this, reason));
  }

  refund() {
    if (this.props.status !== PaymentStatus.COMPLETED) {
      throw new Error('Only completed payments can be refunded');
    }
    this.props.status = PaymentStatus.REFUNDED;
    this.props.updatedAt = new Date();
  }

  canProcess(): boolean {
    return this.props.status === PaymentStatus.PENDING && this.props.amount > 0;
  }

  isSuccessful(): boolean {
    return this.props.status === PaymentStatus.COMPLETED;
  }

  getAmountInCents(): number {
    return Math.round(this.props.amount * 100);
  }
}