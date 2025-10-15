import { Injectable } from '@nestjs/common';
import { Ad } from '../../../domain/entity/ad.entity';
import { AdStatus } from '../../../domain/value-object/ad-status.enum';
import { BudgetType } from '../../../domain/value-object/budget-type.enum';
import { KSACities } from '../../../domain/value-object/ksa-cities.enum';

export interface AdRecord {
  id: string;
  userId: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  websiteUrl: string;
  imageUrl?: string | null;
  status: string;
  active: boolean;
  budgetType: string;
  targetCities: string[];
  impressionsCredit: number;
  spended: number;
  totalImpressionsOnAdd: number;
  likesCount: number;
  rejectionReason?: string | null;
  tiktokLink?: string | null;
  youtubeLink?: string | null;
  googleAdsLink?: string | null;
  instagramLink?: string | null;
  facebookLink?: string | null;
  snapchatLink?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AdMapper {
  toDomain(record: AdRecord): Ad {
    return new Ad(record.id, {
      userId: record.userId,
      titleEn: record.titleEn,
      titleAr: record.titleAr,
      descriptionEn: record.descriptionEn,
      descriptionAr: record.descriptionAr,
      websiteUrl: record.websiteUrl,
      imageUrl: record.imageUrl ?? undefined,
      status: record.status as AdStatus,
      active: record.active,
      budgetType: record.budgetType as BudgetType,
      targetCities: record.targetCities as KSACities[],
      impressionsCredit: record.impressionsCredit,
      spended: record.spended,
      totalImpressionsOnAdd: record.totalImpressionsOnAdd,
      likesCount: record.likesCount,
      rejectionReason: record.rejectionReason ?? undefined,
      tiktokLink: record.tiktokLink ?? undefined,
      youtubeLink: record.youtubeLink ?? undefined,
      googleAdsLink: record.googleAdsLink ?? undefined,
      instagramLink: record.instagramLink ?? undefined,
      facebookLink: record.facebookLink ?? undefined,
      snapchatLink: record.snapchatLink ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Ad): Omit<AdRecord, 'createdAt' | 'updatedAt'> {
    const props = entity.props;
    return {
      id: entity.id,
      userId: props.userId,
      titleEn: props.titleEn,
      titleAr: props.titleAr,
      descriptionEn: props.descriptionEn,
      descriptionAr: props.descriptionAr,
      websiteUrl: props.websiteUrl,
      imageUrl: props.imageUrl ?? null,
      status: props.status,
      active: props.active,
      budgetType: props.budgetType,
      targetCities: props.targetCities,
      impressionsCredit: props.impressionsCredit,
      spended: props.spended,
      totalImpressionsOnAdd: props.totalImpressionsOnAdd,
      likesCount: props.likesCount,
      rejectionReason: props.rejectionReason ?? null,
      tiktokLink: props.tiktokLink ?? null,
      youtubeLink: props.youtubeLink ?? null,
      googleAdsLink: props.googleAdsLink ?? null,
      instagramLink: props.instagramLink ?? null,
      facebookLink: props.facebookLink ?? null,
      snapchatLink: props.snapchatLink ?? null,
    };
  }
}