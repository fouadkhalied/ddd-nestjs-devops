import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
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
}
