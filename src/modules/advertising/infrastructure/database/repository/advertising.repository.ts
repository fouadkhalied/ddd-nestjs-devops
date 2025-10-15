import { Injectable } from '@nestjs/common';
import { fromNullable, map, none, some, Option } from 'effect/Option';
import { and, eq, gt, inArray, like, or, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from 'src/libs/database/db.connection';
import { ads, users } from 'src/libs/database/drizzle.schema';
import { AdvertisingRepository } from '../../../domain/repository/advertising.repository.interface';
import { Ad, AdProps } from '../../../domain/entity/ad.entity';
import { AdMapper } from '../mapper/ad.mapper';
import { AdStatus } from '../../../domain/value-object/ad-status.enum';
import { KSACities } from '../../../domain/value-object/ksa-cities.enum';
import { Collection } from 'src/libs/api/rest/collection.interface';
import { PaginatedQueryParams } from 'src/libs/api/rest/paginated-query-params.dto';

@Injectable()
export class AdvertisingRepositoryImpl implements AdvertisingRepository {
  constructor(private readonly mapper: AdMapper) {}

  // ✅ Create new ad and map to domain
  async createAd(data: AdProps): Promise<Option<Ad>> {
    try {
      const id = uuidv4();

      const [insertedAd] = await db
        .insert(ads)
        .values({
          id,
          userId: data.userId,
          titleEn: data.titleEn,
          titleAr: data.titleAr,
          descriptionEn: data.descriptionEn,
          descriptionAr: data.descriptionAr,
          websiteUrl: data.websiteUrl,
          imageUrl: data.imageUrl,
          budgetType: data.budgetType,
          targetCities: data.targetCities,
        })
        .returning();

      if (!insertedAd) return none();

      // Increment user's adsCount
      await db
        .update(users)
        .set({ adsCount: sql`${users.adsCount} + 1` })
        .where(eq(users.id, data.userId));

      const ad = this.mapper.toDomain(insertedAd);
      ad.create();

      return some(ad);
    } catch (error) {
      console.error('Error creating ad:', error);
      return none();
    }
  }

  // ✅ Find ad by ID
  async findAdById(id: string): Promise<Option<Ad>> {
    try {
      const [record] = await db.select().from(ads).where(eq(ads.id, id));
      return map(fromNullable(record), (data) => this.mapper.toDomain(data));
    } catch (error) {
      console.error('Error finding ad by id:', error);
      return none();
    }
  }

  // ✅ Update ad
  async updateAd(id: string, data: Partial<AdProps>): Promise<Option<Ad>> {
    try {
      const [updated] = await db
        .update(ads)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(ads.id, id))
        .returning();

      return map(fromNullable(updated), (record) =>
        this.mapper.toDomain(record),
      );
    } catch (error) {
      console.error('Error updating ad:', error);
      return none();
    }
  }

  // ✅ Delete ad
  async deleteAd(id: string): Promise<boolean> {
    try {
      const result = await db.delete(ads).where(eq(ads.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting ad:', error);
      return false;
    }
  }

  // ✅ Find all ads (Admin use case)
  async findAllAds<T extends PaginatedQueryParams>(
    params?: T,
    status?: AdStatus,
    userId?: string,
  ): Promise<Collection<Ad>> {
    try {
      const offset = params?.offset || 0;
      const limit = params?.limit || 10;
      const conditions = [];

      if (status) conditions.push(eq(ads.status, status));
      if (userId) conditions.push(eq(ads.userId, userId));

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(ads)
        .where(whereCondition);

      const results = await db
        .select()
        .from(ads)
        .where(whereCondition)
        .orderBy(sql`${ads.createdAt} DESC`)
        .limit(limit)
        .offset(offset);

      return {
        items: results.map((r) => this.mapper.toDomain(r)),
        total: Number(count),
      };
    } catch (error) {
      console.error('Error finding all ads:', error);
      return { items: [], total: 0 };
    }
  }

  // ✅ Find ads by title (user or admin search)
  async findAdsByTitle<T extends PaginatedQueryParams>(
    title: string,
    params?: T,
  ): Promise<Collection<Ad>> {
    try {
      const offset = params?.offset || 0;
      const limit = params?.limit || 10;

      const whereCondition = or(
        like(ads.titleEn, `%${title}%`),
        like(ads.titleAr, `%${title}%`),
      );

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(ads)
        .where(whereCondition);

      const results = await db
        .select()
        .from(ads)
        .where(whereCondition)
        .orderBy(sql`${ads.createdAt} DESC`)
        .limit(limit)
        .offset(offset);

      return {
        items: results.map((record) => this.mapper.toDomain(record)),
        total: Number(count),
      };
    } catch (error) {
      console.error('Error finding ads by title:', error);
      return { items: [], total: 0 };
    }
  }

  // ✅ Find approved ads (for frontend display)
  async findApprovedAds<T extends PaginatedQueryParams>(
    params?: T,
    targetCities?: KSACities[],
    title?: string,
  ): Promise<Collection<Ad>> {
    try {
      const offset = params?.offset || 0;
      const limit = params?.limit || 10;

      const conditions = [
        eq(ads.status, AdStatus.APPROVED),
        eq(ads.active, true),
        gt(ads.impressionsCredit, 0),
      ];

      if (targetCities?.length) {
        conditions.push(
          sql`${ads.targetCities} && ARRAY[${sql.join(
            targetCities.map((c) => sql`${c}`),
            sql`, `,
          )}]::text[]`,
        );
      }

      if (title) {
        conditions.push(
          or(
            sql`LOWER(${ads.titleEn}) LIKE LOWER(${`%${title}%`})`,
            sql`LOWER(${ads.titleAr}) LIKE LOWER(${`%${title}%`})`,
          ),
        );
      }

      const whereCondition = and(...conditions);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(ads)
        .where(whereCondition);

      const results = await db
        .select()
        .from(ads)
        .where(whereCondition)
        .orderBy(sql`${ads.createdAt} DESC`)
        .limit(limit)
        .offset(offset);

      // ✅ Decrement impression credits after fetch
      if (results.length > 0) {
        const adIds = results.map((r) => r.id);
        await db
          .update(ads)
          .set({
            impressionsCredit: sql`${ads.impressionsCredit} - 1`,
            totalImpressionsOnAdd: sql`${ads.totalImpressionsOnAdd} + 1`,
          })
          .where(inArray(ads.id, adIds));
      }

      return {
        items: results.map((r) => this.mapper.toDomain(r)),
        total: Number(count),
      };
    } catch (error) {
      console.error('Error finding approved ads:', error);
      return { items: [], total: 0 };
    }
  }

  // ✅ Add photo to ad
  async addPhotoToAd(id: string, photoUrl: string): Promise<boolean> {
    try {
      const [updated] = await db
        .update(ads)
        .set({ imageUrl: photoUrl, updatedAt: new Date() })
        .where(eq(ads.id, id))
        .returning();
      return !!updated;
    } catch (error) {
      console.error('Error adding photo to ad:', error);
      return false;
    }
  }

  // ✅ Remove photo
  async deletePhotoFromAd(id: string): Promise<boolean> {
    try {
      const [updated] = await db
        .update(ads)
        .set({ imageUrl: null, updatedAt: new Date() })
        .where(eq(ads.id, id))
        .returning();
      return !!updated;
    } catch (error) {
      console.error('Error deleting photo from ad:', error);
      return false;
    }
  }

  // ✅ Check balance
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    try {
      const [user] = await db
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, userId));
      return user ? (user.balance ?? 0) >= amount : false;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  // ✅ Assign credit to ad (with transaction)
  async assignCreditToAdTransaction(
    userId: string,
    adId: string,
    credit: number,
    impressions: number,
  ): Promise<Option<Ad>> {
    try {
      const result = await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ balance: sql`${users.balance} - ${credit}` })
          .where(eq(users.id, userId));

        const [updatedAd] = await tx
          .update(ads)
          .set({
            impressionsCredit: sql`${ads.impressionsCredit} + ${impressions}`,
            spended: sql`${ads.spended} + ${credit}`,
            updatedAt: new Date(),
          })
          .where(eq(ads.id, adId))
          .returning();

        return updatedAd;
      });

      return map(fromNullable(result), (record) =>
        this.mapper.toDomain(record),
      );
    } catch (error) {
      console.error('Error assigning credit to ad:', error);
      return none();
    }
  }
}
