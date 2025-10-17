import { OAuthProvider } from 'src/libs/auth/oauth-provider.enum';
import { BaseEntity } from '../../../../libs/ddd/base-entity.interface';
import { UserRole } from 'src/modules/user/domain/value-object/user-role.enum';

export interface UserProps {
  email: string;
  password?: string | null;
  username?: string | null;
  googleId?: string | null;
  facebookId?: string | null;
  oauth: OAuthProvider;
  role: UserRole;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly props: UserProps,
  ) {}
}
