import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from '../../../../config/env/configuration.constant';
import { isNone, Option, some, none } from 'effect/Option';
import { JwtAuthService } from '../../application/service/jwt-auth-service.interface';
import * as jwt from 'jsonwebtoken';
import { getConfigValue } from '../../../../libs/util/config.util';
import { AuthUser } from '../../api/rest/presentation/dto/auth-user.dto';
import { JwtUser } from '../../api/rest/presentation/dto/jwt-user.dto';

@Injectable()
export class JwtService implements JwtAuthService {
  private readonly tokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly tokenExpiration: number;
  private readonly refreshTokenExpiration: number;

  constructor(private readonly configService: ConfigService) {
    this.tokenSecret = getConfigValue(this.configService, JWT_SECRET);
    this.refreshTokenSecret = getConfigValue<string>(
      this.configService,
      JWT_REFRESH_SECRET,
    );
    this.tokenExpiration = getConfigValue<number>(
      this.configService,
      JWT_EXPIRES_IN,
    );
    this.refreshTokenExpiration = getConfigValue<number>(
      this.configService,
      JWT_REFRESH_EXPIRES_IN,
    );
  }

  async generateToken(user: AuthUser): Promise<string> {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      this.tokenSecret,
      {
        expiresIn: this.tokenExpiration,
      }
    );
  }

  async generateRefreshToken(user: AuthUser): Promise<string> {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiration,
      }
    );
  }

  async generateJwtUser(authUser: AuthUser): Promise<JwtUser> {
    const token = await this.generateToken(authUser);
    const refreshToken = await this.generateRefreshToken(authUser);
    return {
      token,
      expiresIn: this.tokenExpiration,
      refreshToken,
      refreshExpiresIn: this.refreshTokenExpiration,
      user: authUser,
    };
  }

  async generateJwtUserFromRefresh(refreshToken: string): Promise<JwtUser> {
    const authUser = await this.verifyRefreshToken(refreshToken);
    if (isNone(authUser)) throw new UnauthorizedException('Invalid Token!');
    return this.generateJwtUser(this.convertToAuthUser(authUser.value));
  }

  async verifyToken(token: string): Promise<Option<AuthUser>> {
    try {
      const decoded = jwt.verify(token, this.tokenSecret) as any;
      
      console.log('🔍 Decoded token:', decoded);
      
      // Extract only the AuthUser fields
      const authUser: AuthUser = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      
      console.log('✅ Extracted AuthUser:', authUser);
      
      return some(authUser);
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message);
      return none();
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<Option<AuthUser>> {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as any;
      
      const authUser: AuthUser = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      
      return some(authUser);
    } catch (error: any) {
      console.error('❌ Refresh token verification failed:', error.message);
      return none();
    }
  }

  /**
   * Helper method to clean the AuthUser object.
   */
  convertToAuthUser = (authUser: AuthUser): AuthUser => ({
    id: authUser.id,
    email: authUser.email,
    role: authUser.role,
  });
}