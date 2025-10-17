import { IQuery } from '@nestjs/cqrs';

export class GetPurchaseHistoryQuery implements IQuery {
  constructor(
    readonly userId: string,
    readonly page: number = 1,
    readonly limit: number = 10,
  ) {}
}