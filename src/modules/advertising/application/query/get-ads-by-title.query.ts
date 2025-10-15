import { IQuery } from '@nestjs/cqrs';

export class GetAdsByTitleQuery implements IQuery {
  constructor(
    readonly title: string,
    readonly params?: AdParams,
  ) {}
}
