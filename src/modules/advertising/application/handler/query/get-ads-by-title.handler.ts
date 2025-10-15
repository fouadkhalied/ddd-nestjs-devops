import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdsByTitleQuery } from '../../query/get-ads-by-title.query';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { Collection } from '../../../../../libs/api/rest/collection.interface';
import { Ad } from '../../../domain/entity/ad.entity';

@QueryHandler(GetAdsByTitleQuery)
export class GetAdsByTitleHandler implements IQueryHandler<GetAdsByTitleQuery> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
  ) {}

  async execute(query: GetAdsByTitleQuery): Promise<Collection<Ad>> {
    return await this.advertisingRepository.findAdsByTitle(
      query.title,
      query.params ? {
        offset: query.params.offset ?? 0,
        limit: query.params.limit ?? 10,
      } : { offset: 0, limit: 10 },
    );
  }
}