import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ApproveAdCommand } from '../../command/approve-ad.command';

@CommandHandler('ApproveAd')
export class ApproveAdHandler implements ICommandHandler<ApproveAdCommand> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly repo: AdvertisingRepository,
  ) {}

  async execute(command: ApproveAdCommand) {
    // Expect command: { id, status }
    return this.repo.updateAd(command.adId, command.socialMediaLinks, {
      status: command.status,
    });
  }
}
