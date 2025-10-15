import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { AdStatus } from 'src/modules/advertising/domain/value-object/ad-status.enum';
import { KSACities } from 'src/modules/advertising/domain/value-object/ksa-cities.enum';

export class AdFilterParams {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;

  @IsOptional()
  @IsArray()
  @IsEnum(KSACities, { each: true })
  targetCities?: KSACities[];
}
