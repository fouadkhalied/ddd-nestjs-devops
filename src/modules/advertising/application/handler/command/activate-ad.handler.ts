import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ActivateAdCommand } from '../../command/activate-ad.command';

@CommandHandler('ActivateAd')
export class ActivateAdHandler implements ICommandHandler<ActivateAdCommand> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly repo: AdvertisingRepository,
  ) {}

  async execute(command: ActivateAdCommand) {
    return this.repo.updateAd(command.adId, { active: true });
  }
}
