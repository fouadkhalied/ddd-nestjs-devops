import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Option, isNone } from 'effect/Option';
import { ActivateAdCommand } from '../../command/activate-ad.command';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { Ad } from '../../../domain/entity/ad.entity';

@CommandHandler(ActivateAdCommand)
export class ActivateAdHandler implements ICommandHandler<ActivateAdCommand> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ActivateAdCommand): Promise<Option<Ad>> {
    const ad = await this.advertisingRepository.findAdById(command.adId);

    if (isNone(ad)) {
      throw new NotFoundException(`Ad with id ${command.adId} not found`);
    }

    this.eventPublisher.mergeObjectContext(ad.value);

    // Domain logic - will throw if not approved or no credits
    ad.value.activate();

    const updated = await this.advertisingRepository.updateAd(
      command.adId,
      ad.value.props,
    );

    if (isNone(updated)) {
      throw new NotFoundException('Failed to activate ad');
    }

    updated.value.commit();

    return updated;
  }
}
