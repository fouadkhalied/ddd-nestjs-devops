import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordBody {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email!: string;
}