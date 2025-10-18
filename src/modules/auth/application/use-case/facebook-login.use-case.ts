import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { Option, some, none } from 'effect/Option';
import { AuthUser } from '../../api/rest/presentation/dto/auth-user.dto';
import { AUTH_REPOSITORY } from '../../auth.tokens';
import { UserRole } from '../../../user/domain/value-object/user-role.enum';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';
import { OAuthProvider } from 'src/libs/auth/oauth-provider.enum';

export interface FacebookProfile {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class FacebookLoginUseCase implements UseCase<FacebookProfile, Option<AuthUser>> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(profile: FacebookProfile): Promise<Option<AuthUser>> {
    let user = await this.authRepository.findByFacebookId(profile.id);

    if (!user) {
      const existingUser = await this.authRepository.findByEmail(profile.email);

      if (existingUser) {
        user = await this.authRepository.linkFacebookAccount(
          existingUser.id,
          profile.id,
        );
      } else {
        user = await this.authRepository.create({
          email: profile.email,
          username: profile.name,
          facebookId: profile.id,
          oauth: OAuthProvider.FACEBOOK,
          verified: true,
          role: UserRole.USER,
        });
      }
    }

    if (!user) return none();

    return some({
      id: user.id,
      email: user.props.email,
      role: user.props.role,
    });
  }
}
