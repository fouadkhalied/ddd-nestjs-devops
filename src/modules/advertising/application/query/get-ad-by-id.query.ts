import { IQuery } from '@nestjs/cqrs';

export class GetAdByIdQuery implements IQuery {
  constructor(readonly id: string) {}
}
