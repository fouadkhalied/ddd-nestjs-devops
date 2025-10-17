import { OAuthProvider } from 'src/libs/auth/oauth-provider.enum';
import { User } from '../entities/user.entity';

export interface CreateUserDto {
  email: string;
  password?: string;
  username?: string;
  oauth?: OAuthProvider;
  role?: string;
  verified?: boolean;
  googleId?: string;
  facebookId?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByFacebookId(facebookId: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  verifyUser(id: string): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string): Promise<User>;
  linkFacebookAccount(userId: string, facebookId: string): Promise<User>;
}