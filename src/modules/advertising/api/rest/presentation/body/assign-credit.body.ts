import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCreditBody {
  @ApiProperty({ example: 100, description: 'Credit amount to assign' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  credit!: number;
}
