import { Ad } from 'src/modules/advertising/domain/entity/ad.entity';

export class AdDto {
  id!: string;
  titleEn!: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  websiteUrl?: string;
  imageUrl?: string | null;
  targetCities?: string[];
  status?: any;
  active?: boolean;
}

export function toAdDto(ad: Ad): AdDto {
  return {
    id: ad.id,
    titleEn: ad.props.titleEn,
    titleAr: ad.props.titleAr,
    descriptionEn: ad.props.descriptionEn ?? '',
    descriptionAr: ad.props.descriptionAr ?? '',
    imageUrl: ad.props.imageUrl ?? '',
    websiteUrl: ad.props.websiteUrl ?? '',
    status: ad.props.status,
    active: ad.props.active ?? true,
    targetCities: ad.props.targetCities ?? [],
  };
}
