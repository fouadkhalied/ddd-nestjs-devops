import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginBody } from '../presentation/body/login.body';
import { SignupBody } from '../presentation/body/signup.body';
import { PublicApi } from '../../../../../libs/decorator/auth.decorator';
import { getOrThrowWith, Option } from 'effect/Option';
import { JwtUser } from '../presentation/dto/jwt-user.dto';
import { JwtAuthService } from '../../../application/service/jwt-auth-service.interface';
import {
  JWT_AUTH_SERVICE,
  LOGIN_USE_CASE,
  SIGNUP_USE_CASE,
  REFRESH_TOKEN_USE_CASE,
  VERIFY_EMAIL_USE_CASE,
  RESEND_OTP_USE_CASE,
  FORGOT_PASSWORD_USE_CASE,
  RESET_PASSWORD_USE_CASE,
} from '../../../auth.tokens';
import { UseCase } from '../../../../../libs/ddd/use-case.interface';
import { AuthUser } from '../presentation/dto/auth-user.dto';
import { RefreshTokenBody } from '../presentation/body/refresh-token.body';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(JWT_AUTH_SERVICE)
    private readonly jwtAuth: JwtAuthService,
    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: UseCase<LoginBody, Option<AuthUser>>,
    @Inject(SIGNUP_USE_CASE)
    private readonly signupUseCase: UseCase<SignupBody, Option<AuthUser>>,
    @Inject(REFRESH_TOKEN_USE_CASE)
    private readonly refreshTokenUseCase: UseCase<string, JwtUser>,
    @Inject(VERIFY_EMAIL_USE_CASE)
    private readonly verifyEmailUseCase: UseCase<any, boolean>,
    @Inject(RESEND_OTP_USE_CASE)
    private readonly resendOtpUseCase: UseCase<string, boolean>,
    @Inject(FORGOT_PASSWORD_USE_CASE)
    private readonly forgotPasswordUseCase: UseCase<string, boolean>,
    @Inject(RESET_PASSWORD_USE_CASE)
    private readonly resetPasswordUseCase: UseCase<any, boolean>,
  ) {}

  @PublicApi()
  @Post('/login')
  async login(@Body() body: LoginBody): Promise<JwtUser> {
    return this.jwtAuth.generateJwtUser(
      getOrThrowWith(
        await this.loginUseCase.execute(body),
        () => new UnauthorizedException('Login Error!'),
      ),
    );
  }

  @PublicApi()
  @Post('/signup')
  async signup(@Body() body: SignupBody): Promise<JwtUser> {
    return this.jwtAuth.generateJwtUser(
      getOrThrowWith(
        await this.signupUseCase.execute(body),
        () => new UnauthorizedException('Signup Error!'),
      ),
    );
  }

  @PublicApi()
  @Post('/token/refresh')
  async refreshToken(@Body() body: RefreshTokenBody): Promise<JwtUser> {
    return this.refreshTokenUseCase.execute(body.token);
  }

  @PublicApi()
  @Post('/verify-email')
  async verifyEmail(@Body() body: VerifyEmailBody): Promise<{ success: boolean }> {
    const success = await this.verifyEmailUseCase.execute(body);
    return { success };
  }

  @PublicApi()
  @Post('/resend-otp')
  async resendOtp(@Body() body: ResendOtpBody): Promise<{ success: boolean }> {
    const success = await this.resendOtpUseCase.execute(body.email);
    return { success };
  }

  @PublicApi()
  @Post('/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordBody): Promise<{ success: boolean }> {
    const success = await this.forgotPasswordUseCase.execute(body.email);
    return { success };
  }

  @PublicApi()
  @Post('/reset-password')
  async resetPassword(@Body() body: ResetPasswordBody): Promise<{ success: boolean }> {
    const success = await this.resetPasswordUseCase.execute(body);
    return { success };
  }
}