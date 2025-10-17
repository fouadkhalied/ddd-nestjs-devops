import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../../domain/value-object/payment-method.enum';

export class CreateCheckoutSessionBody {
  @ApiProperty({ example: 100, description: 'Payment amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiProperty({ example: 'SAR', description: 'Currency code' })
  @IsNotEmpty()
  @IsString()
  currency!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.PAYMOB })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty({ example: 'ad-uuid', required: false })
  @IsOptional()
  @IsString()
  adId?: string;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  impressions?: number;
}