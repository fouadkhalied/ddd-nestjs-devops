import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { AuthController } from './api/rest/controller/auth.controller';

// Guards
import { AuthGuard } from './api/guard/auth.guard';

// Services
import { JwtService } from './infrastructure/jwt/jwt.service';
import { BcryptPasswordHasher } from './infrastructure/password/bcrypt-password-hasher.service';
import { GoogleOAuthService } from './infrastructure/oauth/google-oauth.service';
import { FacebookOAuthService } from './infrastructure/oauth/facebook-oauth.service';
import { OtpService } from './infrastructure/otp/otp.service';              

// Repositories
import { AuthRepository } from './infrastructure/repository/auth.repository';
import { OtpRepository } from './infrastructure/repository/otp.repository';  

// Use Cases
import { LoginUseCase } from './application/use-case/login.use-case';
import { SignupUseCase } from './application/use-case/signup.use-case';
import { GoogleLoginUseCase } from './application/use-case/google-login.use-case';
import { FacebookLoginUseCase } from './application/use-case/facebook-login.use-case';
import { RefreshTokenUseCase } from './application/use-case/refresh-token.use-case';
import { VerifyEmailUseCase } from './application/use-case/verify-email.use-case';
import { ResendOtpUseCase } from './application/use-case/resend-otp.use-case';
import { ForgotPasswordUseCase } from './application/use-case/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-case/reset-password.use-case';


// Tokens
import {
  JWT_AUTH_SERVICE,
  PASSWORD_HASHER,
  AUTH_REPOSITORY,
  OTP_REPOSITORY,     
  OTP_SERVICE,        
  EMAIL_SERVICE,      
  GOOGLE_OAUTH_SERVICE,
  FACEBOOK_OAUTH_SERVICE,
  LOGIN_USE_CASE,
  SIGNUP_USE_CASE,
  GOOGLE_LOGIN_USE_CASE,
  FACEBOOK_LOGIN_USE_CASE,
  REFRESH_TOKEN_USE_CASE,
  VERIFY_EMAIL_USE_CASE,
  RESEND_OTP_USE_CASE,
  FORGOT_PASSWORD_USE_CASE,
  RESET_PASSWORD_USE_CASE,
} from './auth.tokens';
import { RegisterUserHandler } from './application/command/handler/register-user.command';
import { CheckAuthUserByIdHandler } from './application/query/check-auth-user-by-id.query';
import { GetAuthUserByEmailHandler } from './application/query/get-auth-user-by-email.query';
import { EmailService } from './infrastructure/email/email.service';
import { OAuthController } from './api/rest/controller/oauth.controller';

const CommandHandlers = [RegisterUserHandler];
const QueryHandlers = [CheckAuthUserByIdHandler, GetAuthUserByEmailHandler];

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [AuthController, OAuthController],  
  providers: [
    // Global Guard
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Infrastructure Services
    {
      provide: JWT_AUTH_SERVICE,
      useClass: JwtService,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    // ADD THESE THREE PROVIDERS:
    {
      provide: OTP_REPOSITORY,
      useClass: OtpRepository,
    },
    {
      provide: OTP_SERVICE,
      useClass: OtpService,
    },
    {
      provide: EMAIL_SERVICE,
      useClass: EmailService,
    },
    // END OF NEW PROVIDERS
    {
      provide: GOOGLE_OAUTH_SERVICE,
      useClass: GoogleOAuthService,
    },
    {
      provide: FACEBOOK_OAUTH_SERVICE,
      useClass: FacebookOAuthService,
    },
    // Use Cases
    {
      provide: LOGIN_USE_CASE,
      useClass: LoginUseCase,
    },
    {
      provide: SIGNUP_USE_CASE,
      useClass: SignupUseCase,
    },
    {
      provide: GOOGLE_LOGIN_USE_CASE,
      useClass: GoogleLoginUseCase,
    },
    {
      provide: FACEBOOK_LOGIN_USE_CASE,
      useClass: FacebookLoginUseCase,
    },
    {
      provide: REFRESH_TOKEN_USE_CASE,
      useClass: RefreshTokenUseCase,
    },
    {
      provide: VERIFY_EMAIL_USE_CASE,
      useClass: VerifyEmailUseCase,
    },
    {
      provide: RESEND_OTP_USE_CASE,
      useClass: ResendOtpUseCase,
    },
    {
      provide: FORGOT_PASSWORD_USE_CASE,
      useClass: ForgotPasswordUseCase,
    },
    {
      provide: RESET_PASSWORD_USE_CASE,
      useClass: ResetPasswordUseCase,
    },
    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [JWT_AUTH_SERVICE, AUTH_REPOSITORY],
})
export class AuthModule {}
