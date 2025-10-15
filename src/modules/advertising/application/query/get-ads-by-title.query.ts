import { IQuery } from '@nestjs/cqrs';
import { AdParams } from '../../api/rest/presentation/params/ad.params';

export class GetAdsByTitleQuery implements IQuery {
  constructor(
    readonly title: string,
    readonly params?: AdParams,
  ) {}
}
