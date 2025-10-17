import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Option } from 'effect/Option';
import { GetPaymentBySessionIdQuery } from '../../query/get-payment-by-session-id.query';
import { PaymentRepository } from '../../../domain/repository/payment.repository.interface';
import { PAYMENT_REPOSITORY } from '../../../payment.tokens';
import { Payment } from '../../../domain/entity/payment.entity';

@QueryHandler(GetPaymentBySessionIdQuery)
export class GetPaymentBySessionIdHandler
  implements IQueryHandler<GetPaymentBySessionIdQuery>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(query: GetPaymentBySessionIdQuery): Promise<Option<Payment>> {
    return await this.paymentRepository.findPaymentBySessionId(
      query.sessionId,
    );
  }
}