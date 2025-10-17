import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Option } from 'effect/Option';
import { GetPaymentByIdQuery } from '../../query/get-payment-by-id.query';
import { PaymentRepository } from '../../../domain/repository/payment.repository.interface';
import { PAYMENT_REPOSITORY } from '../../../payment.tokens';
import { Payment } from '../../../domain/entity/payment.entity';

@QueryHandler(GetPaymentByIdQuery)
export class GetPaymentByIdHandler
  implements IQueryHandler<GetPaymentByIdQuery>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(query: GetPaymentByIdQuery): Promise<Option<Payment>> {
    return await this.paymentRepository.findPaymentById(query.id);
  }
}