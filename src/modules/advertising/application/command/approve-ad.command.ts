import { ICommand } from '@nestjs/cqrs';

export interface SocialMediaLinks {
  tiktokLink?: string;
  youtubeLink?: string;
  googleAdsLink?: string;
  instagramLink?: string;
  facebookLink?: string;
  snapchatLink?: string;
}

export class ApproveAdCommand implements ICommand {
  constructor(
    readonly adId: string,
    readonly socialMediaLinks?: SocialMediaLinks,
  ) {}
}
