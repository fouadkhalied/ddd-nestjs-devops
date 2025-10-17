import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { AUTH_REPOSITORY, PASSWORD_HASHER } from '../../auth.tokens';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase implements UseCase<ResetPasswordDto, boolean> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<boolean> {
    const user = await this.authRepository.findByEmail(dto.email);
    
    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    // TODO: Verify reset token validity
    // You should have a service that verifies the reset token
    
    const hashedPassword = await this.passwordHasher.hash(dto.newPassword);
    
    await this.authRepository.update(user.id, {
      props: { ...user.props, password: hashedPassword },
    } as any);
    
    return true;
  }
}