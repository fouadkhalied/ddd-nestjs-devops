import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Option } from 'effect/Option';
import { CreateAdCommand } from '../../command/create-ad.command';
import { CreateAdUseCase } from '../../use-case/create-ad.use-case';
import { CREATE_AD_USE_CASE } from '../../../advertising.tokens';
import { Ad } from '../../../domain/entity/ad.entity';
import { AdStatus } from '../../../domain/value-object/ad-status.enum';

@CommandHandler(CreateAdCommand)
export class CreateAdHandler implements ICommandHandler<CreateAdCommand> {
  constructor(
    @Inject(CREATE_AD_USE_CASE)
    private readonly createAdUseCase: CreateAdUseCase,
  ) {}

  async execute(command: CreateAdCommand): Promise<Option<Ad>> {
    return await this.createAdUseCase.execute({
      userId: command.userId,
      titleEn: command.titleEn,
      titleAr: command.titleAr,
      descriptionEn: command.descriptionEn,
      descriptionAr: command.descriptionAr,
      websiteUrl: command.websiteUrl,
      budgetType: command.budgetType,
      targetCities: command.targetCities,
      status: AdStatus.PENDING,
      active: false,
      impressionsCredit: 0,
      spended: 0,
      totalImpressionsOnAdd: 0,
      likesCount: 0,
    });
  }
}
