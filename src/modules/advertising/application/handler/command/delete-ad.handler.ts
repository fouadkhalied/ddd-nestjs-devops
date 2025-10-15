import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { DeleteAdCommand } from '../../command/delete-ad.command';

@CommandHandler('DeleteAd')
export class DeleteAdHandler implements ICommandHandler<DeleteAdCommand> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly repo: AdvertisingRepository,
  ) {}

  async execute(command: DeleteAdCommand) {
    return this.repo.deleteAd(command.adId);
  }
}
