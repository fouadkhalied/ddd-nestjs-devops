import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

export class ApproveAdBody {
  @ApiProperty({ example: 'https://tiktok.com/@user', required: false })
  @IsOptional()
  @IsUrl()
  tiktokLink?: string;

  @ApiProperty({ example: 'https://youtube.com/@channel', required: false })
  @IsOptional()
  @IsUrl()
  youtubeLink?: string;

  @ApiProperty({ example: 'https://ads.google.com', required: false })
  @IsOptional()
  @IsUrl()
  googleAdsLink?: string;

  @ApiProperty({ example: 'https://instagram.com/user', required: false })
  @IsOptional()
  @IsUrl()
  instagramLink?: string;

  @ApiProperty({ example: 'https://facebook.com/page', required: false })
  @IsOptional()
  @IsUrl()
  facebookLink?: string;

  @ApiProperty({ example: 'https://snapchat.com/add/user', required: false })
  @IsOptional()
  @IsUrl()
  snapchatLink?: string;
}
