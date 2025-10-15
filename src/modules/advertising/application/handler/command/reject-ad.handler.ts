import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Option, isNone } from 'effect/Option';
import { RejectAdCommand } from '../../command/reject-ad.command';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { Ad } from '../../../domain/entity/ad.entity';

@CommandHandler(RejectAdCommand)
export class RejectAdHandler implements ICommandHandler<RejectAdCommand> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RejectAdCommand): Promise<Option<Ad>> {
    const ad = await this.advertisingRepository.findAdById(command.adId);

    if (isNone(ad)) {
      throw new NotFoundException(`Ad with id ${command.adId} not found`);
    }

    this.eventPublisher.mergeObjectContext(ad.value);

    ad.value.reject(command.reason);

    const updated = await this.advertisingRepository.updateAd(
      command.adId,
      ad.value.props,
    );

    if (isNone(updated)) {
      throw new NotFoundException('Failed to reject ad');
    }

    updated.value.commit();

    return updated;
  }
}
