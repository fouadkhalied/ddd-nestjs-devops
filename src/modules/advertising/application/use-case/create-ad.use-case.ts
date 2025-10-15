import { Injectable, Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { isNone, none, Option } from 'effect/Option';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { Ad, AdProps } from '../../domain/entity/ad.entity';
import { AdvertisingRepository } from '../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../advertising.tokens';
import { AdStatus } from '../../domain/value-object/ad-status.enum';

@Injectable()
export class CreateAdUseCase implements UseCase<AdProps, Option<Ad>> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(data: AdProps): Promise<Option<Ad>> {
    // Set default values
    const adData: AdProps = {
      ...data,
      status: AdStatus.PENDING,
      active: false,
      impressionsCredit: 0,
      spended: 0,
      totalImpressionsOnAdd: 0,
      likesCount: 0,
    };

    const ad = await this.advertisingRepository.createAd(adData);

    if (isNone(ad)) return none();

    this.eventPublisher.mergeObjectContext(ad.value);
    ad.value.commit();

    return ad;
  }
}
