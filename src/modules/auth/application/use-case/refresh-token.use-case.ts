import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { JwtUser } from '../../api/rest/presentation/dto/jwt-user.dto';
import { JWT_AUTH_SERVICE } from '../../auth.tokens';
import { JwtAuthService } from '../service/jwt-auth-service.interface';

@Injectable()
export class RefreshTokenUseCase implements UseCase<string, JwtUser> {
  constructor(
    @Inject(JWT_AUTH_SERVICE)
    private readonly jwtService: JwtAuthService,
  ) {}

  async execute(refreshToken: string): Promise<JwtUser> {
    return this.jwtService.generateJwtUserFromRefresh(refreshToken);
  }
}
