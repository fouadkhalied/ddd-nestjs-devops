import { Option } from 'effect/Option';
import { Ad, AdProps } from '../entity/ad.entity';
import { Collection } from '../../../../libs/api/rest/collection.interface';
import { PaginatedQueryParams } from '../../../../libs/api/rest/paginated-query-params.dto';
import { AdStatus } from '../value-object/ad-status.enum';
import { KSACities } from '../value-object/ksa-cities.enum';

export interface AdvertisingRepository {
  createAd(data: AdProps): Promise<Option<Ad>>;

  findAdById(id: string): Promise<Option<Ad>>;

  updateAd(id: string, data: Partial<AdProps>): Promise<Option<Ad>>;

  deleteAd(id: string): Promise<boolean>;

  findAllAds<T extends PaginatedQueryParams>(
    params?: T,
    status?: AdStatus,
    userId?: string,
  ): Promise<Collection<Ad>>;

  findAdsByTitle<T extends PaginatedQueryParams>(
    title: string,
    params?: T,
  ): Promise<Collection<Ad>>;

  findApprovedAds<T extends PaginatedQueryParams>(
    params?: T,
    targetCities?: KSACities[],
    title?: string,
  ): Promise<Collection<Ad>>;

  addPhotoToAd(id: string, photoUrl: string): Promise<boolean>;

  deletePhotoFromAd(id: string): Promise<boolean>;

  hasSufficientBalance(userId: string, amount: number): Promise<boolean>;

  assignCreditToAdTransaction(
    userId: string,
    adId: string,
    credit: number,
    impressions: number,
  ): Promise<Option<Ad>>;
}
