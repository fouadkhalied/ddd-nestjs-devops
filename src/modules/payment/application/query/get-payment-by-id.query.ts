import { IQuery } from '@nestjs/cqrs';

export class GetPaymentByIdQuery implements IQuery {
  constructor(readonly id: string) {}
}