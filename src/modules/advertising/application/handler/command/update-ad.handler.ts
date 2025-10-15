import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Option } from 'effect/Option';
import { UpdateAdCommand } from '../../command/update-ad.command';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { Ad } from '../../../domain/entity/ad.entity';

@CommandHandler(UpdateAdCommand)
export class UpdateAdHandler implements ICommandHandler<UpdateAdCommand> {
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
  ) {}

  async execute(command: UpdateAdCommand): Promise<Option<Ad>> {
    return await this.advertisingRepository.updateAd(
      command.adId,
      command.data,
    );
  }
}
