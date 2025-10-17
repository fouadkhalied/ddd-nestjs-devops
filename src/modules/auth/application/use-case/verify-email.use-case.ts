import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { AUTH_REPOSITORY } from '../../auth.tokens';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

@Injectable()
export class VerifyEmailUseCase implements UseCase<VerifyEmailDto, boolean> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(dto: VerifyEmailDto): Promise<boolean> {
    const user = await this.authRepository.findByEmail(dto.email);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.props.verified) {
      throw new BadRequestException('User already verified');
    }

    // TODO: Implement OTP verification logic here
    // You should have an OTP service that verifies the code
    
    await this.authRepository.verifyUser(user.id);
    return true;
  }
}