import { ICommand } from '@nestjs/cqrs';
import { BudgetType } from '../../domain/value-object/budget-type.enum';
import { KSACities } from '../../domain/value-object/ksa-cities.enum';

export class UpdateAdCommand implements ICommand {
  constructor(
    readonly adId: string,
    readonly data: {
      titleEn?: string;
      titleAr?: string;
      descriptionEn?: string;
      descriptionAr?: string;
      websiteUrl?: string;
      budgetType?: BudgetType;
      targetCities?: KSACities[];
    },
  ) {}
}
