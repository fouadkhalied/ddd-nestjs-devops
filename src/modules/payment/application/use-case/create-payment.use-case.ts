import { Injectable, Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { isNone, none, Option } from 'effect/Option';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { Payment, PaymentProps } from '../../domain/entity/payment.entity';
import { PaymentRepository } from '../../domain/repository/payment.repository.interface';
import { PAYMENT_REPOSITORY } from '../../payment.tokens';
import { PaymentStatus } from '../../domain/value-object/payment-status.enum';
import { PaymentMethod } from '../../domain/value-object/payment-method.enum';

export interface CreatePaymentInput {
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  impressionsAllocated?: number;
  adsId?: string;
}

@Injectable()
export class CreatePaymentUseCase
  implements UseCase<CreatePaymentInput, Option<Payment>>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: CreatePaymentInput): Promise<Option<Payment>> {
    const paymentData: PaymentProps = {
      userId: input.userId,
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      status: PaymentStatus.PENDING,
      stripeSessionId: input.stripeSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId,
      impressionsAllocated: input.impressionsAllocated,
      adsId: input.adsId,
    };

    const payment = await this.paymentRepository.createPayment(paymentData);

    if (isNone(payment)) return none();

    this.eventPublisher.mergeObjectContext(payment.value);
    payment.value.create();
    payment.value.commit();

    return payment;
  }
}