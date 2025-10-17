import { Payment } from '../../../../domain/entity/payment.entity';
import { PaymentStatus } from '../../../../domain/value-object/payment-status.enum';
import { PaymentMethod } from '../../../../domain/value-object/payment-method.enum';

export class PaymentDto {
  id!: string;
  userId!: string;
  amount!: number;
  currency!: string;
  method!: PaymentMethod;
  status!: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  impressionsAllocated?: number;
  adsId?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export function toPaymentDto(payment: Payment): PaymentDto {
  return {
    id: payment.id,
    userId: payment.props.userId,
    amount: payment.props.amount,
    currency: payment.props.currency,
    method: payment.props.method,
    status: payment.props.status,
    stripeSessionId: payment.props.stripeSessionId,
    stripePaymentIntentId: payment.props.stripePaymentIntentId,
    impressionsAllocated: payment.props.impressionsAllocated,
    adsId: payment.props.adsId,
    createdAt: payment.props.createdAt ?? new Date(),
    updatedAt: payment.props.updatedAt ?? new Date(),
  };
}