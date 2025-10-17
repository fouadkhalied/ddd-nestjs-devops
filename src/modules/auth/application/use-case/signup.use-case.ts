import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { none, Option, some } from 'effect/Option';
import { CommandBus } from '@nestjs/cqrs';
import { AuthUser } from '../../api/rest/presentation/dto/auth-user.dto';
import { SignupBody } from '../../api/rest/presentation/body/signup.body';
import { RegisterUserCommand } from '../command/register-user.command';
import { CustomConflictException } from '../../../../libs/exceptions/custom-conflict.exception';
import { AUTH_REPOSITORY } from '../../auth.tokens';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class SignupUseCase implements UseCase<SignupBody, Option<AuthUser>> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(body: SignupBody): Promise<Option<AuthUser>> {
    const existingUser = await this.authRepository.findByEmail(body.email);
    
    if (existingUser) {
      throw new CustomConflictException(existingUser.props.email);
    }

    const user = await this.commandBus.execute(
      new RegisterUserCommand(
        body.email,
        body.password,
        body.firstName,
        body.lastName,
      ),
    );

    if (!user) return none();

    return some({
      id: user.id,
      email: user.props.email,
      role: user.props.role,
    });
  }
}