import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AdStatus } from 'src/modules/advertising/domain/value-object/ad-status.enum';
import { KSACities } from 'src/modules/advertising/domain/value-object/ksa-cities.enum';

export class AdParams {
  @ApiPropertyOptional({ description: 'Filter by ad status', enum: AdStatus })
  @IsEnum(AdStatus)
  @IsOptional()
  status?: AdStatus;

  @ApiPropertyOptional({
    description: 'Filter by target city',
    enum: KSACities,
  })
  @IsEnum(KSACities)
  @IsOptional()
  targetCity?: KSACities;

  @ApiPropertyOptional({ description: 'Search by ad title' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Page offset', default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}