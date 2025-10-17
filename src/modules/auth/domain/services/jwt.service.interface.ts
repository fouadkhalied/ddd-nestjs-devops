import { JwtPayload } from '../../../../libs/auth/jwt-payload.interface';

export interface IJwtService {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}
