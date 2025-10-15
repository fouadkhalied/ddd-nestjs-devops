import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { RejectAdCommand } from '../../command/reject-ad.command';

@CommandHandler('RejectAd')
export class RejectAdHandler implements ICommandHandler<RejectAdCommand> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly repo: AdvertisingRepository,
  ) {}

  async execute(command: RejectAdCommand) {
    return this.repo.updateAd(command.adId, {
      rejectionReason: command.reason,
    });
  }
}
