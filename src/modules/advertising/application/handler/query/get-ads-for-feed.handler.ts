import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { GetApprovedAdsQuery } from '../../query/get-ads-for-feed.query';

@QueryHandler(GetApprovedAdsQuery)
export class GetApprovedAdsHandler implements IQueryHandler<GetApprovedAdsQuery> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly repo: AdvertisingRepository,
  ) {}

  async execute(query: any) {
    return this.repo.findApprovedAds(query || {});
  }
}
