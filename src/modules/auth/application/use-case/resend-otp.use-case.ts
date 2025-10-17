import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { AUTH_REPOSITORY } from '../../auth.tokens';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class ResendOtpUseCase implements UseCase<string, boolean> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(email: string): Promise<boolean> {
    const user = await this.authRepository.findByEmail(email);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.props.verified) {
      throw new BadRequestException('User already verified');
    }

    // TODO: Implement OTP generation and sending logic
    // You should have an OTP service that generates and sends the code
    
    return true;
  }
}