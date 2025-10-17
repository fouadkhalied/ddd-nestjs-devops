import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendOtpBody {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email!: string;
}