import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { AUTH_REPOSITORY, PASSWORD_HASHER } from '../../auth.tokens';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import { UserRole } from '../../../user/domain/value-object/user-role.enum';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';
import { OAuthProvider } from 'src/libs/auth/oauth-provider.enum';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const hashedPassword = await this.passwordHasher.hash(command.password);

    return this.authRepository.create({
      email: command.email,
      password: hashedPassword,
      username: `${command.firstName} ${command.lastName}`,
      oauth: OAuthProvider.NORMAL,
      verified: false,
      role: UserRole.USER.toString(),
    });
  }
}