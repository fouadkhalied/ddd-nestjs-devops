import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ADVERTISING_REPOSITORY } from '../../../advertising.tokens';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { AssignCreditCommand } from '../../command/assign-credit.command';

@CommandHandler('AssignCredit')
export class AssignCreditHandler
  implements ICommandHandler<AssignCreditCommand>
{
  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly repo: AdvertisingRepository,
  ) {}

  async execute(command: AssignCreditCommand) {
    // command must contain userId, adId, credit, impressions
    return this.repo.assignCreditToAdTransaction(
      command.userId,
      command.adId,
      command.credit,
      command.impressions,
    );
  }
}
