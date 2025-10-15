import { IsNotEmpty, IsString, IsEnum, IsArray, IsUrl } from 'class-validator';
import { BudgetType } from 'src/modules/advertising/domain/value-object/budget-type.enum';
import { KSACities } from 'src/modules/advertising/domain/value-object/ksa-cities.enum';

export class CreateAdBody {
  @IsNotEmpty()
  @IsString()
  titleEn!: string;

  @IsNotEmpty()
  @IsString()
  titleAr!: string;

  @IsNotEmpty()
  @IsString()
  descriptionEn!: string;

  @IsNotEmpty()
  @IsString()
  descriptionAr!: string;

  @IsNotEmpty()
  @IsUrl()
  websiteUrl!: string;

  @IsNotEmpty()
  @IsEnum(BudgetType)
  budgetType!: BudgetType;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(KSACities, { each: true })
  targetCities!: KSACities[];
}
