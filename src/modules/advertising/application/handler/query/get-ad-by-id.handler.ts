import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Option } from 'effect/Option';
import { GetAdByIdQuery } from '../../query/get-ad-by-id.query';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { Ad } from '../../../domain/entity/ad.entity';

@QueryHandler(GetAdByIdQuery)
export class GetAdByIdHandler implements IQueryHandler<GetAdByIdQuery> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
  ) {}

  async execute(query: GetAdByIdQuery): Promise<Option<Ad>> {
    return await this.advertisingRepository.findAdById(query.id);
  }
}
