import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Option } from 'effect/Option';
import { AssignCreditCommand } from '../../command/assign-credit.command';
import { AssignCreditUseCase } from '../../use-case/assign-credit.use-case';
import { ASSIGN_CREDIT_USE_CASE } from '../../../advertising.tokens';
import { Ad } from '../../../domain/entity/ad.entity';

@CommandHandler(AssignCreditCommand)
export class AssignCreditHandler
  implements ICommandHandler<AssignCreditCommand>
{
  constructor(
    @Inject(ASSIGN_CREDIT_USE_CASE)
    private readonly assignCreditUseCase: AssignCreditUseCase,
  ) {}

  async execute(command: AssignCreditCommand): Promise<Option<Ad>> {
    return await this.assignCreditUseCase.execute({
      userId: command.userId,
      adId: command.adId,
      credit: command.credit,
    });
  }
}
