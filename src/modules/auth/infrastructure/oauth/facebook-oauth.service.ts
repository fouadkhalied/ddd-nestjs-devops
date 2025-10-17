import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FacebookOAuthService {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;
  private readonly graphApiVersion: string = 'v20.0';

  constructor() {
    this.appId = process.env.FACEBOOK_APP_ID!;
    this.appSecret = process.env.FACEBOOK_APP_SECRET!;
    this.redirectUri = process.env.FACEBOOK_REDIRECT_URI!;
  }

  async generateAuthUrl(): Promise<string> {
    const permissions = ['email', 'public_profile'];
    
    return `https://www.facebook.com/${this.graphApiVersion}/dialog/oauth?` +
      `client_id=${this.appId}` +
      `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
      `&scope=${permissions.join(',')}` +
      `&response_type=code`;
  }

  async getUserProfile(code: string): Promise<any> {
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/${this.graphApiVersion}/oauth/access_token`,
      {
        params: {
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: this.redirectUri,
          code,
        },
      },
    );

    const { access_token } = tokenResponse.data;

    const profileResponse = await axios.get(
      `https://graph.facebook.com/${this.graphApiVersion}/me`,
      {
        params: {
          access_token,
          fields: 'id,email,name',
        },
      },
    );

    return {
      id: profileResponse.data.id,
      email: profileResponse.data.email,
      name: profileResponse.data.name,
    };
  }
}