import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { LoginBody } from '../../api/rest/presentation/body/login.body';
import { fromNullable, none, Option } from 'effect/Option';
import { AuthUser } from '../../api/rest/presentation/dto/auth-user.dto';
import { AUTH_REPOSITORY, PASSWORD_HASHER } from '../../auth.tokens';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';
import { ApiRole } from 'src/libs/api/api-role.enum';

@Injectable()
export class LoginUseCase implements UseCase<LoginBody, Option<AuthUser>> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(body: LoginBody): Promise<Option<AuthUser>> {
    const user = await this.authRepository.findByEmail(body.email);
    
    if (!user || !user.canLogin()) {
      return none();
    }

    if (!user.props.password) {
      throw new UnauthorizedException('Invalid Credentials!');
    }

    const match = await this.passwordHasher.compare(
      body.password,
      user.props.password,
    );

    if (!match) {
      throw new UnauthorizedException('Invalid Credentials!');
    }

    return fromNullable({
      id: user.id,
      email: user.props.email,
      role: user.props.role,
    });
  }
}