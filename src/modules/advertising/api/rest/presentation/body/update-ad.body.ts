import { IsOptional, IsString, IsEnum, IsArray, IsUrl } from 'class-validator';
import { BudgetType } from 'src/modules/advertising/domain/value-object/budget-type.enum';
import { KSACities } from 'src/modules/advertising/domain/value-object/ksa-cities.enum';

export class UpdateAdBody {
  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsEnum(BudgetType)
  budgetType?: BudgetType;

  @IsOptional()
  @IsArray()
  @IsEnum(KSACities, { each: true })
  targetCities?: KSACities[];
}
