import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { AUTH_REPOSITORY } from '../../auth.tokens';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class ForgotPasswordUseCase implements UseCase<string, boolean> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(email: string): Promise<boolean> {
    const user = await this.authRepository.findByEmail(email);
    
    if (!user) {
      // Don't reveal that user doesn't exist
      return true;
    }

    // TODO: Implement password reset token generation and email sending
    // You should have a service that generates a reset token and sends email
    
    return true;
  }
}