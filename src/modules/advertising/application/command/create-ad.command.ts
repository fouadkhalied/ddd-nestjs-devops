import { ICommand } from '@nestjs/cqrs';
import { BudgetType } from '../../domain/value-object/budget-type.enum';
import { KSACities } from '../../domain/value-object/ksa-cities.enum';

export class CreateAdCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly titleEn: string,
    readonly titleAr: string,
    readonly descriptionEn: string,
    readonly descriptionAr: string,
    readonly websiteUrl: string,
    readonly budgetType: BudgetType,
    readonly targetCities: KSACities[],
  ) {}
}
