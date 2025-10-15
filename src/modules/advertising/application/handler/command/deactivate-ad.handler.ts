import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Option, isNone } from 'effect/Option';
import { DeactivateAdCommand } from '../../command/deactivate-ad.command';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { Ad } from '../../../domain/entity/ad.entity';

@CommandHandler(DeactivateAdCommand)
export class DeactivateAdHandler
  implements ICommandHandler<DeactivateAdCommand>
{
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeactivateAdCommand): Promise<Option<Ad>> {
    const ad = await this.advertisingRepository.findAdById(command.adId);

    if (isNone(ad)) {
      throw new NotFoundException(`Ad with id ${command.adId} not found`);
    }

    // Verify ownership
    if (ad.value.props.userId !== command.userId) {
      throw new ForbiddenException(
        'You do not have permission to deactivate this ad',
      );
    }

    // Merge with event publisher context
    this.eventPublisher.mergeObjectContext(ad.value);

    // Domain logic for deactivation
    ad.value.deactivate();

    // Persist changes
    const updated = await this.advertisingRepository.updateAd(
      command.adId,
      ad.value.props,
    );

    if (isNone(updated)) return updated;

    // Commit events
    updated.value.commit();

    return updated;
  }
}
