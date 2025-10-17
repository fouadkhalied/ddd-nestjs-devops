import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPurchaseHistoryQuery } from '../../query/get-purchase-history.query';
import { PaymentRepository, PurchaseHistoryResult } from '../../../domain/repository/payment.repository.interface';
import { PAYMENT_REPOSITORY } from '../../../payment.tokens';

@QueryHandler(GetPurchaseHistoryQuery)
export class GetPurchaseHistoryHandler
  implements IQueryHandler<GetPurchaseHistoryQuery>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(query: GetPurchaseHistoryQuery): Promise<PurchaseHistoryResult> {
    const offset = (query.page - 1) * query.limit;
    
    return await this.paymentRepository.getPurchaseHistory(query.userId, {
      offset,
      limit: query.limit,
    });
  }
}