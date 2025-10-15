
import { Injectable, Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { isNone, Option } from 'effect/Option';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { Ad } from '../../domain/entity/ad.entity';
import { AdvertisingRepository } from '../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../advertising.tokens';

export interface ApproveAdInput {
  adId: string;
  socialMediaLinks?: {
    tiktokLink?: string;
    youtubeLink?: string;
    googleAdsLink?: string;
    instagramLink?: string;
    facebookLink?: string;
    snapchatLink?: string;
  };
}

@Injectable()
export class ApproveAdUseCase implements UseCase<ApproveAdInput, Option<Ad>> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: ApproveAdInput): Promise<Option<Ad>> {
    const ad = await this.advertisingRepository.findAdById(input.adId);

    if (isNone(ad)) {
      return ad;
    }

    this.eventPublisher.mergeObjectContext(ad.value);
    
    ad.value.approve(input.socialMediaLinks);

    const updated = await this.advertisingRepository.updateAd(
      input.adId,
      ad.value.props,
    );

    if (isNone(updated)) return updated;

    updated.value.commit();

    return updated;
  }
}
