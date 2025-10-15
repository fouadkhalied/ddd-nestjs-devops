import { IQuery } from '@nestjs/cqrs';
import { AdStatus } from '../../domain/value-object/ad-status.enum';
import { PaginatedQueryParams } from '../../../../libs/api/rest/paginated-query-params.dto';

export class GetAllAdsQuery implements IQuery {
  constructor(
    public readonly params?: PaginatedQueryParams,
    public readonly status?: AdStatus,
    public readonly userId?: string,
  ) {}
}
