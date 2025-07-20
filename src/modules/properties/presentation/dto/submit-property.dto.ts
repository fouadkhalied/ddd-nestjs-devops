import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsIn,
} from 'class-validator';

export class SubmitPropertyDto {
  @IsString()
  mlsId!: string;

  @IsOptional()
  @IsString()
  projectId?: string; // Changed from number to string for UUID

  @IsOptional()
  @IsString()
  propertyTypeId?: string; // Changed from number to string for UUID

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  priceAmount?: number;

  @IsOptional()
  @IsString()
  @IsIn(['USD', 'EUR', 'EGP', 'AED', 'SAR', 'QAR'])
  priceCurrency?: string;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  areaSqm?: number;

  @IsOptional()
  @IsNumber()
  yearBuilt?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  listingType?: string;

  @IsOptional()
  @IsString()
  listedBy?: string;
}
