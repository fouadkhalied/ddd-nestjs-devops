
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteAdCommand } from '../../command/delete-ad.command';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';

@CommandHandler(DeleteAdCommand)
export class DeleteAdHandler implements ICommandHandler<DeleteAdCommand> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
  ) {}

  async execute(command: DeleteAdCommand): Promise<boolean> {
    const deleted = await this.advertisingRepository.deleteAd(command.adId);

    if (!deleted) {
      throw new NotFoundException(`Ad with id ${command.adId} not found`);
    }

    return true;
  }
}