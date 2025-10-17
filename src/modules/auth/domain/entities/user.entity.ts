import { BaseEntity } from '../../../../libs/ddd/base-entity.interface';
import { OAuthProvider } from '../../../../libs/auth/oauth-provider.enum';
import { UserRole } from '../../../user/domain/value-object/user-role.enum';
import { UserState } from '../../../user/domain/value-object/user-state.enum';

export interface UserProps {
  email: string;
  password?: string | null;
  username?: string | null;
  googleId?: string | null;
  facebookId?: string | null;
  oauth: OAuthProvider;
  role: UserRole;
  state: UserState;
  verified: boolean;
  country?: string | null;
  freeViewsCredits?: number;
  balance?: number;
  totalSpend?: number;
  adsCount?: number;
  stripeCustomerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly props: UserProps,
  ) {}

  static create(id: string, props: UserProps): User {
    return new User(id, props);
  }

  isActive(): boolean {
    return this.props.state === UserState.ACTIVE;
  }

  isVerified(): boolean {
    return this.props.verified;
  }

  canLogin(): boolean {
    return this.isActive() && this.isVerified();
  }
}