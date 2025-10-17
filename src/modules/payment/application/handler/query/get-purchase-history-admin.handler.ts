import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPurchaseHistoryAdminQuery } from '../../query/get-purchase-history-admin.query';
import { PaymentRepository, AdminPurchaseHistoryResult } from '../../../domain/repository/payment.repository.interface';
import { PAYMENT_REPOSITORY } from '../../../payment.tokens';

@QueryHandler(GetPurchaseHistoryAdminQuery)
export class GetPurchaseHistoryAdminHandler
  implements IQueryHandler<GetPurchaseHistoryAdminQuery>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(query: GetPurchaseHistoryAdminQuery): Promise<AdminPurchaseHistoryResult> {
    const offset = (query.page - 1) * query.limit;
    
    return await this.paymentRepository.getPurchaseHistoryForAdmin({
      offset,
      limit: query.limit,
    });
  }
}