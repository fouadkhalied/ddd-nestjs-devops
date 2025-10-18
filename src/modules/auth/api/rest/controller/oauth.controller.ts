import {
    Controller,
    Get,
    Query,
    Res,
    Inject,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { PublicApi } from '../../../../../libs/decorator/auth.decorator';
  import { getOrThrowWith } from 'effect/Option';
  import {
    GOOGLE_OAUTH_SERVICE,
    FACEBOOK_OAUTH_SERVICE,
    GOOGLE_LOGIN_USE_CASE,
    FACEBOOK_LOGIN_USE_CASE,
    JWT_AUTH_SERVICE,
  } from '../../../auth.tokens';
  import { UseCase } from '../../../../../libs/ddd/use-case.interface';
  import { AuthUser } from '../presentation/dto/auth-user.dto';
  import { JwtAuthService } from '../../../application/service/jwt-auth-service.interface';
  import { GoogleOAuthService } from '../../../infrastructure/oauth/google-oauth.service';
  import { FacebookOAuthService } from '../../../infrastructure/oauth/facebook-oauth.service';
  import { GoogleProfile } from '../../../application/use-case/google-login.use-case';
  import { FacebookProfile } from '../../../application/use-case/facebook-login.use-case';
  import { Option } from 'effect/Option';
  
  @Controller('oauth')
  export class OAuthController {
    constructor(
      @Inject(GOOGLE_OAUTH_SERVICE)
      private readonly googleOAuthService: GoogleOAuthService,
      @Inject(FACEBOOK_OAUTH_SERVICE)
      private readonly facebookOAuthService: FacebookOAuthService,
      @Inject(GOOGLE_LOGIN_USE_CASE)
      private readonly googleLoginUseCase: UseCase<GoogleProfile, Option<AuthUser>>,
      @Inject(FACEBOOK_LOGIN_USE_CASE)
      private readonly facebookLoginUseCase: UseCase<FacebookProfile, Option<AuthUser>>,
      @Inject(JWT_AUTH_SERVICE)
      private readonly jwtAuth: JwtAuthService,
    ) {}
  
    @PublicApi()
    @Get('google/url')
    async getGoogleAuthUrl(): Promise<{ url: string }> {
      const url = await this.googleOAuthService.generateAuthUrl();
      return { url };
    }
  
    @PublicApi()
    @Get('google/callback')
    async googleCallback(
      @Query('code') code: string,
      @Res() res: Response,
    ): Promise<void> {
      if (!code) {
        throw new UnauthorizedException('Authorization code is required');
      }
  
      try {
        const profile = await this.googleOAuthService.getUserProfile(code);
        
        const authUser = getOrThrowWith(
          await this.googleLoginUseCase.execute(profile),
          () => new UnauthorizedException('Google login failed'),
        );
  
        const jwtUser = await this.jwtAuth.generateJwtUser(authUser);
  
        // Redirect to frontend with token
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${jwtUser.token}&refreshToken=${jwtUser.refreshToken}`;
        res.redirect(redirectUrl);
      } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Google authentication failed`);
      }
    }
  
    @PublicApi()
    @Get('facebook/url')
    async getFacebookAuthUrl(): Promise<{ url: string }> {
      const url = await this.facebookOAuthService.generateAuthUrl();
      return { url };
    }
  
    @PublicApi()
    @Get('facebook/callback')
    async facebookCallback(
      @Query('code') code: string,
      @Res() res: Response,
    ): Promise<void> {
      if (!code) {
        throw new UnauthorizedException('Authorization code is required');
      }
  
      try {
        const profile = await this.facebookOAuthService.getUserProfile(code);
        
        const authUser = getOrThrowWith(
          await this.facebookLoginUseCase.execute(profile),
          () => new UnauthorizedException('Facebook login failed'),
        );
  
        const jwtUser = await this.jwtAuth.generateJwtUser(authUser);
  
        // Redirect to frontend with token
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${jwtUser.token}&refreshToken=${jwtUser.refreshToken}`;
        res.redirect(redirectUrl);
      } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Facebook authentication failed`);
      }
    }
  }