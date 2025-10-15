import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllAdsQuery } from '../../query/get-all-ads.query';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { Collection } from '../../../../../libs/api/rest/collection.interface';
import { Ad } from '../../../domain/entity/ad.entity';

@QueryHandler(GetAllAdsQuery)
export class GetAllAdsHandler implements IQueryHandler<GetAllAdsQuery> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
  ) {}

  async execute(query: GetAllAdsQuery): Promise<Collection<Ad>> {
    return await this.advertisingRepository.findAllAds(
      query.params,
      query.status,
      query.userId,
    );
  }
}