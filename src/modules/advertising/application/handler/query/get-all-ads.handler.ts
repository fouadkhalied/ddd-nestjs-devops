import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { GetAllAdsQuery } from '../../query/get-all-ads.query';

@QueryHandler('GetAllAds')
export class GetAllAdsHandler implements IQueryHandler<GetAllAdsQuery> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly repo: AdvertisingRepository,
  ) {}

  async execute(query: any) {
    // Expect query to be PaginatedQueryParams or similar
    return this.repo.findAllAds(query || {});
  }
}
