import { AggregateRoot } from '@nestjs/cqrs';
import { AdStatus } from '../value-object/ad-status.enum';
import { BudgetType } from '../value-object/budget-type.enum';
import { KSACities } from '../value-object/ksa-cities.enum';
import { AdCreatedEvent } from '../event/ad-created.event';
import { AdApprovedEvent } from '../event/ad-approved.event';

export interface AdProps {
  userId: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  websiteUrl: string;
  imageUrl?: string;
  status: AdStatus;
  active: boolean;
  budgetType: BudgetType;
  targetCities: KSACities[];
  impressionsCredit: number;
  spended: number;
  totalImpressionsOnAdd: number;
  likesCount: number;
  rejectionReason?: string;
  tiktokLink?: string;
  youtubeLink?: string;
  googleAdsLink?: string;
  instagramLink?: string;
  facebookLink?: string;
  snapchatLink?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Ad extends AggregateRoot {
  id: string;
  props: AdProps;

  constructor(id: string, props: AdProps) {
    super();
    this.id = id;
    this.props = props;
  }

  create() {
    this.apply(new AdCreatedEvent(this));
  }

  approve(socialMediaLinks?: {
    tiktokLink?: string;
    youtubeLink?: string;
    googleAdsLink?: string;
    instagramLink?: string;
    facebookLink?: string;
    snapchatLink?: string;
  }) {
    this.props.status = AdStatus.APPROVED;
    this.props.active = true;

    if (socialMediaLinks) {
      if (socialMediaLinks.tiktokLink)
        this.props.tiktokLink = socialMediaLinks.tiktokLink;
      if (socialMediaLinks.youtubeLink)
        this.props.youtubeLink = socialMediaLinks.youtubeLink;
      if (socialMediaLinks.googleAdsLink)
        this.props.googleAdsLink = socialMediaLinks.googleAdsLink;
      if (socialMediaLinks.instagramLink)
        this.props.instagramLink = socialMediaLinks.instagramLink;
      if (socialMediaLinks.facebookLink)
        this.props.facebookLink = socialMediaLinks.facebookLink;
      if (socialMediaLinks.snapchatLink)
        this.props.snapchatLink = socialMediaLinks.snapchatLink;
    }

    this.apply(new AdApprovedEvent(this));
  }

  reject(reason?: string) {
    this.props.status = AdStatus.REJECTED;
    this.props.rejectionReason = reason;
  }

  activate() {
    if (this.props.status !== AdStatus.APPROVED) {
      throw new Error('Cannot activate ad that is not approved');
    }
    if (
      this.props.budgetType === BudgetType.IMPRESSIONS &&
      this.props.impressionsCredit <= 0
    ) {
      throw new Error('Cannot activate ad: insufficient impression credits');
    }
    this.props.active = true;
  }

  deactivate() {
    this.props.active = false;
  }

  assignCredit(impressions: number, cost: number) {
    this.props.impressionsCredit += impressions;
    this.props.spended += cost;
  }

  recordImpression() {
    if (this.props.impressionsCredit > 0) {
      this.props.impressionsCredit--;
      this.props.totalImpressionsOnAdd++;
    }
  }
}
