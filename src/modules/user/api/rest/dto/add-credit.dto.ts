import { IsNumber, IsPositive } from 'class-validator';

export class AddCreditDto {
  @IsNumber()
  @IsPositive()
  credit!: number;
}
