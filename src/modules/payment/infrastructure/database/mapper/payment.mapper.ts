import { Injectable } from '@nestjs/common';
import { Payment, PaymentProps } from '../../../domain/entity/payment.entity';
import { PaymentStatus } from '../../../domain/value-object/payment-status.enum';
import { PaymentMethod } from '../../../domain/value-object/payment-method.enum';

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  method: string;
  status: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentMapper {
  toDomain(record: PaymentRecord): Payment {
    const props: PaymentProps = {
      userId: record.userId,
      amount: parseFloat(record.amount),
      currency: record.currency,
      method: record.method as PaymentMethod,
      status: record.status as PaymentStatus,
      stripeSessionId: record.stripeSessionId ?? undefined,
      stripePaymentIntentId: record.stripePaymentIntentId ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new Payment(record.id, props);
  }

  toPersistence(entity: Payment): Omit<PaymentRecord, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      userId: entity.props.userId,
      amount: entity.props.amount.toString(),
      currency: entity.props.currency,
      method: entity.props.method,
      status: entity.props.status,
      stripeSessionId: entity.props.stripeSessionId ?? null,
      stripePaymentIntentId: entity.props.stripePaymentIntentId ?? null,
    };
  }
}