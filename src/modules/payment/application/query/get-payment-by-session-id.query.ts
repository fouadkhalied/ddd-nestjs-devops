import { IQuery } from '@nestjs/cqrs';

export class GetPaymentBySessionIdQuery implements IQuery {
  constructor(readonly sessionId: string) {}
}