import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AdStatus } from '../../../../domain/value-object/ad-status.enum';

export class ApproveAdBody {
  @ApiProperty({ enum: AdStatus, example: AdStatus.APPROVED })
  @IsEnum(AdStatus)
  status: AdStatus;

  @ApiProperty({ example: 'Approved for publication', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
