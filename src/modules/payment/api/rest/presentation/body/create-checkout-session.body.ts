import { IsNotEmpty, IsNumber, IsString, IsEnum, Min, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../../domain/value-object/payment-method.enum';

export class CreateCheckoutSessionBody {
  @ApiProperty({ example: 100, description: 'Payment amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: 'SAR', description: 'Currency code' })
  @IsNotEmpty()
  @IsString()
  currency!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.PAYMOB })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}