import { IQuery } from '@nestjs/cqrs';

export class GetPurchaseHistoryAdminQuery implements IQuery {
  constructor(
    readonly page: number = 1,
    readonly limit: number = 10,
  ) {}
}
