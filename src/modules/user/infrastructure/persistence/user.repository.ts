import { Injectable } from '@nestjs/common';
import { eq, desc, sql, and, gte, lte, inArray } from 'drizzle-orm';
import { db } from '../../../../libs/database/db.connection';
import { 
  users, 
  socialMediaPages,
  purchases,
  clicksEvents,
  impressionsEvents,
  ads
} from '../../../../libs/database/drizzle.schema';
import { User, UserProps } from '../../domain/entity/user.entity';
import { UserRepository as IUserRepository } from '../../domain/repository/user.repository.interface';
import { Collection } from '../../../../libs/api/rest/collection.interface';
import { PaginatedQueryParams } from '../../../../libs/api/rest/paginated-query-params.dto';
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserRepository implements IUserRepository {

  
async createUser(data: UserProps): Promise<User | null> {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        password: hashedPassword,
        username: data.firstName || 'User',
        role: data.role,
        verified: data.state === 'ACTIVE',
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
      })
      .returning();

    if (!user) return null;

    return new User(user.id, {
      email: user.email,
      password: user.password!,
      firstName: user.username || 'user',
      role: user.role as any,
      state: user.verified ? 'ACTIVE' as any : 'DISABLED' as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

async getUserByEmail(email: string): Promise<User | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) return null;

    return new User(user.id, {
      email: user.email,
      password: user.password || '',
      firstName: user.username || 'user',
      role: user.role as any,
      state: user.verified ? 'ACTIVE' as any : 'DISABLED' as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}
  
  async getUserById(id: string): Promise<User | null> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        verified: users.verified,
        freeViewsCredits: users.freeViewsCredits,
        createdAt: users.createdAt,
        adsCount: users.adsCount,
        totalSpend: users.totalSpend,
        balance: users.balance,
        oauth: users.oauth,
        country: users.country,
        // Social media page fields
        pageId: socialMediaPages.pageId,
        pageName: socialMediaPages.pageName,
        pageType: socialMediaPages.pageType,
        isActive: socialMediaPages.isActive,
      })
      .from(users)
      .leftJoin(socialMediaPages, eq(users.id, socialMediaPages.userId))
      .where(eq(users.id, id));
  
    if (result.length === 0) {
      return null;
    }
  
    // Group the results to handle multiple social media pages
    const userData = {
      id: result[0].id,
      username: result[0].username,
      email: result[0].email,
      role: result[0].role,
      verified: result[0].verified,
      freeViewsCredits: result[0].freeViewsCredits,
      createdAt: result[0].createdAt,
      adsCount: result[0].adsCount,
      balance: result[0].balance,
      totalSpend: result[0].totalSpend,
      oauth: result[0].oauth,
      country: result[0].country,
      socialMediaPages: result
        .filter(row => row.pageId !== null)
        .map(row => ({
          pageId: row.pageId!,
          pageName: row.pageName!,
          pageType: row.pageType!,
          isActive: row.isActive!,
        }))
    };
  
    return new User(userData.id, {
      email: userData.email,
      password: "",
      firstName: userData.username || "user",
      role: userData.role as any,
      state: 'ACTIVE' as any,
      createdAt: userData.createdAt,
      updatedAt: userData.createdAt,
    });
  }

  async checkActiveUserById(id: string): Promise<boolean> {
    const [user] = await db
      .select({ verified: users.verified })
      .from(users)
      .where(eq(users.id, id));

    return user?.verified || false;
  }

  async getAllUsers<T extends PaginatedQueryParams>(
    params?: T,
  ): Promise<Collection<User>> {
    try {
      const { limit = 10, offset = 0 } = params || {};

      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      const [{ count }] = await countQuery;

      const results = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          freeViewsCredits: users.freeViewsCredits,
          createdAt: users.createdAt,
          adsCount: users.adsCount,
          totalSpend: users.totalSpend,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const userEntities = results.map(user => new User(user.id, {
        email: user.email,
        password: "",
        firstName: user.username || "user",
        role: user.role as any,
        state: 'ACTIVE' as any,
        createdAt: user.createdAt,
        updatedAt: user.createdAt,
      }));

      return {
        items: userEntities,
        total: Number(count),
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      return {
        items: [],
        total: 0,
      };
    }
  }

  async updateUser(id: string, updates: Partial<any>): Promise<User | null> {
    try {

      const [user] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      if (!user) return null;

      return new User(user.id, {
        email: user.email,
        password: user.password!,
        firstName: user.username || "user",
        role: user.role as any,
        state: 'ACTIVE' as any,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();
      
      return !!deleted;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async makeUserAdmin(id: string): Promise<User | null> {
    try {
      const [user] = await db
        .update(users)
        .set({
          role: 'admin',
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
    
      if (!user) {
        return null;
      }
    
      return new User(user.id, {
        email: user.email,
        password: user.password!,
        firstName: user.username || "user",
        role: user.role as any,
        state: 'ACTIVE' as any,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error('Error making user admin:', error);
      return null;
    }
  }

  async addCreditToUser(userId: string, credit: number): Promise<boolean> {
    try {
      const [user] = await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${credit}`
        })
        .where(eq(users.id, userId))
        .returning();
    
      return !!user;
    } catch (error) {
      console.error('Error adding credit:', error);
      return false;
    }
  }

  
async getDashboardStats(userId: string, days: number = 7): Promise<any> {
  try {
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2));
    
    const previousPeriodEnd = new Date(currentPeriodStart);

    // Get user's ads
    const userAds = await db
      .select({ id: ads.id })
      .from(ads)
      .where(eq(ads.userId, userId));

    const adIds = userAds.map(ad => ad.id);

    if (adIds.length === 0) {
      return {
        totalImpressions: 0,
        impressionGrowth: 0,
        totalClicks: 0,
        clickGrowth: 0,
        clickThroughRate: 0,
        ctrGrowth: 0,
        remainingBalance: 0,
        balanceGrowth: 0,
      };
    }

    // Current period impressions
    const currentImpressions = await db
      .select({ count: sql<number>`count(*)` })
      .from(impressionsEvents)
      .where(
        and(
          inArray(impressionsEvents.adId, adIds),
          gte(impressionsEvents.createdAt, currentPeriodStart)
        )
      );

    // Previous period impressions
    const previousImpressions = await db
      .select({ count: sql<number>`count(*)` })
      .from(impressionsEvents)
      .where(
        and(
          inArray(impressionsEvents.adId, adIds),
          gte(impressionsEvents.createdAt, previousPeriodStart),
          lte(impressionsEvents.createdAt, previousPeriodEnd)
        )
      );

    // Current period clicks
    const currentClicks = await db
      .select({ count: sql<number>`count(*)` })
      .from(clicksEvents)
      .where(
        and(
          inArray(clicksEvents.adId, adIds),
          gte(clicksEvents.createdAt, currentPeriodStart)
        )
      );

    // Previous period clicks
    const previousClicks = await db
      .select({ count: sql<number>`count(*)` })
      .from(clicksEvents)
      .where(
        and(
          inArray(clicksEvents.adId, adIds),
          gte(clicksEvents.createdAt, previousPeriodStart),
          lte(clicksEvents.createdAt, previousPeriodEnd)
        )
      );

    // Get user balance
    const [userBalance] = await db
      .select({ 
        balance: users.balance,
        freeViewsCredits: users.freeViewsCredits 
      })
      .from(users)
      .where(eq(users.id, userId));

    const totalImpressions = Number(currentImpressions[0]?.count || 0);
    const prevImpressions = Number(previousImpressions[0]?.count || 0);
    const totalClicks = Number(currentClicks[0]?.count || 0);
    const prevClicks = Number(previousClicks[0]?.count || 0);

    // Calculate growth percentages
    const impressionGrowth = prevImpressions > 0 
      ? ((totalImpressions - prevImpressions) / prevImpressions) * 100 
      : 0;

    const clickGrowth = prevClicks > 0 
      ? ((totalClicks - prevClicks) / prevClicks) * 100 
      : 0;

    // Calculate CTR
    const currentCTR = totalImpressions > 0 
      ? (totalClicks / totalImpressions) * 100 
      : 0;

    const previousCTR = prevImpressions > 0 
      ? (prevClicks / prevImpressions) * 100 
      : 0;

    const ctrGrowth = previousCTR > 0 
      ? ((currentCTR - previousCTR) / previousCTR) * 100 
      : 0;

    const remainingBalance = (userBalance?.balance || 0);

    return {
      totalImpressions,
      impressionGrowth: Math.round(impressionGrowth * 10) / 10,
      totalClicks,
      clickGrowth: Math.round(clickGrowth * 10) / 10,
      clickThroughRate: Math.round(currentCTR * 100) / 100,
      ctrGrowth: Math.round(ctrGrowth * 10) / 10,
      remainingBalance,
      balanceGrowth: 0,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
}

async getChartData(userId: string, days: number = 7): Promise<any> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user's ads
    const userAds = await db
      .select({ id: ads.id })
      .from(ads)
      .where(eq(ads.userId, userId));

    const adIds = userAds.map(ad => ad.id);

    if (adIds.length === 0) {
      return [];
    }

    // Get daily impressions
    const dailyImpressions = await db
      .select({
        date: sql<string>`DATE(${impressionsEvents.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(impressionsEvents)
      .where(
        and(
          inArray(impressionsEvents.adId, adIds),
          gte(impressionsEvents.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${impressionsEvents.createdAt})`)
      .orderBy(sql`DATE(${impressionsEvents.createdAt})`);

    // Get daily clicks
    const dailyClicks = await db
      .select({
        date: sql<string>`DATE(${clicksEvents.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(clicksEvents)
      .where(
        and(
          inArray(clicksEvents.adId, adIds),
          gte(clicksEvents.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${clicksEvents.createdAt})`)
      .orderBy(sql`DATE(${clicksEvents.createdAt})`);

    // Merge impressions and clicks data
    const impressionMap = new Map(
      dailyImpressions.map(d => [d.date, Number(d.count)])
    );
    const clickMap = new Map(
      dailyClicks.map(d => [d.date, Number(d.count)])
    );

    // Create array of all dates in range
    const chartData: any[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];

      chartData.push({
        date: dateStr,
        impressions: impressionMap.get(dateStr) || 0,
        clicks: clickMap.get(dateStr) || 0,
      });
    }

    return chartData;
  } catch (error) {
    console.error('Error getting chart data:', error);
    throw error;
  }
}

async getTopPerformingAds(userId: string, limit: number = 5): Promise<any> {
  try {
    // Subquery for impressions count per ad
    const impressionsSub = db
      .select({
        adId: impressionsEvents.adId,
        impressions: sql<number>`COUNT(*)`.as('impressions'),
      })
      .from(impressionsEvents)
      .groupBy(impressionsEvents.adId)
      .as('impr_sub');

    // Subquery for clicks count per ad
    const clicksSub = db
      .select({
        adId: clicksEvents.adId,
        clicks: sql<number>`COUNT(*)`.as('clicks'),
      })
      .from(clicksEvents)
      .groupBy(clicksEvents.adId)
      .as('click_sub');

    // Join ads with aggregated subqueries
    const topAds = await db
      .select({
        id: ads.id,
        titleEn: ads.titleEn,
        titleAr: ads.titleAr,
        imageUrl: ads.imageUrl,
        impressions: sql<number>`COALESCE("impr_sub"."impressions", 0)`.as('impressions'),
        clicks: sql<number>`COALESCE("click_sub"."clicks", 0)`.as('clicks'),
      })
      .from(ads)
      .leftJoin(impressionsSub, eq(impressionsSub.adId, ads.id))
      .leftJoin(clicksSub, eq(clicksSub.adId, ads.id))
      .where(eq(ads.userId, userId))
      .orderBy(desc(sql`COALESCE("click_sub"."clicks", 0)`))
      .limit(limit);

    // Compute CTR
    return topAds.map(ad => {
      const impressions = Number(ad.impressions) || 0;
      const clicks = Number(ad.clicks) || 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

      return {
        id: ad.id,
        titleEn: ad.titleEn,
        titleAr: ad.titleAr,
        imageUrl: ad.imageUrl,
        impressions,
        clicks,
        ctr: Math.round(ctr * 100) / 100,
      };
    });
  } catch (error) {
    console.error('Error getting top performing ads:', error);
    throw error;
  }
}

async getRecentActivity(userId: string, limit: number = 10): Promise<any> {
  try {
    // Get user's ads
    const userAds = await db
      .select({ id: ads.id, titleEn: ads.titleEn, titleAr: ads.titleAr })
      .from(ads)
      .where(eq(ads.userId, userId));

    const adIds = userAds.map(ad => ad.id);
    const adMap = new Map(userAds.map(ad => [ad.id, ad]));

    if (adIds.length === 0) {
      return [];
    }

    // Get recent impressions
    const recentImpressions = await db
      .select({
        id: impressionsEvents.id,
        adId: impressionsEvents.adId,
        type: sql<string>`'impression'`,
        createdAt: impressionsEvents.createdAt,
      })
      .from(impressionsEvents)
      .where(inArray(impressionsEvents.adId, adIds))
      .orderBy(desc(impressionsEvents.createdAt))
      .limit(limit);

    // Get recent clicks
    const recentClicks = await db
      .select({
        id: clicksEvents.id,
        adId: clicksEvents.adId,
        type: sql<string>`'click'`,
        createdAt: clicksEvents.createdAt,
      })
      .from(clicksEvents)
      .where(inArray(clicksEvents.adId, adIds))
      .orderBy(desc(clicksEvents.createdAt))
      .limit(limit);

    // Combine and sort by date
    const activities = [...recentImpressions, ...recentClicks]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(activity => ({
        ...activity,
        adTitle: adMap.get(activity.adId)?.titleEn || 'Unknown Ad',
      }));

    return activities;
  } catch (error) {
    console.error('Error getting recent activity:', error);
    throw error;
  }
}

async getAdminDashboardStats(days: number = 7): Promise<any> {
  try {
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2));
    
    const previousPeriodEnd = new Date(currentPeriodStart);

    // Total users
    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [currentPeriodUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, currentPeriodStart));

    const [previousPeriodUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          gte(users.createdAt, previousPeriodStart),
          lte(users.createdAt, previousPeriodEnd)
        )
      );

    // Total revenue
    const [totalRevenueResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(${purchases.amount} AS DECIMAL)), 0)` 
      })
      .from(purchases)
      .where(eq(purchases.status, "completed"));

    const [currentPeriodRevenue] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(${purchases.amount} AS DECIMAL)), 0)` 
      })
      .from(purchases)
      .where(
        and(
          eq(purchases.status, "completed"),
          gte(purchases.createdAt, currentPeriodStart)
        )
      );

    const [previousPeriodRevenue] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(${purchases.amount} AS DECIMAL)), 0)` 
      })
      .from(purchases)
      .where(
        and(
          eq(purchases.status, "completed"),
          gte(purchases.createdAt, previousPeriodStart),
          lte(purchases.createdAt, previousPeriodEnd)
        )
      );

    // Active ads
    const [activeAdsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(eq(ads.active, true));

    const [currentPeriodAds] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(
        and(
          eq(ads.active, true),
          gte(ads.createdAt, currentPeriodStart)
        )
      );

    const [previousPeriodAds] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(
        and(
          eq(ads.active, true),
          gte(ads.createdAt, previousPeriodStart),
          lte(ads.createdAt, previousPeriodEnd)
        )
      );

    // Total impressions
    const [totalImpressionsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(impressionsEvents);

    const [currentPeriodImpressions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(impressionsEvents)
      .where(gte(impressionsEvents.createdAt, currentPeriodStart));

    const [previousPeriodImpressions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(impressionsEvents)
      .where(
        and(
          gte(impressionsEvents.createdAt, previousPeriodStart),
          lte(impressionsEvents.createdAt, previousPeriodEnd)
        )
      );

    // Calculate totals and growth
    const totalUsers = Number(totalUsersResult.count || 0);
    const currentUsers = Number(currentPeriodUsers.count || 0);
    const prevUsers = Number(previousPeriodUsers.count || 0);
    const userGrowth = prevUsers > 0 ? ((currentUsers - prevUsers) / prevUsers) * 100 : 0;

    const totalRevenue = Number(totalRevenueResult.total || 0);
    const currentRevenue = Number(currentPeriodRevenue.total || 0);
    const prevRevenue = Number(previousPeriodRevenue.total || 0);
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const activeAds = Number(activeAdsResult.count || 0);
    const currentAds = Number(currentPeriodAds.count || 0);
    const prevAds = Number(previousPeriodAds.count || 0);
    const adsGrowth = prevAds > 0 ? ((currentAds - prevAds) / prevAds) * 100 : 0;

    const totalImpressions = Number(totalImpressionsResult.count || 0);
    const currentImpressions = Number(currentPeriodImpressions.count || 0);
    const prevImpressions = Number(previousPeriodImpressions.count || 0);
    const impressionGrowth = prevImpressions > 0 
      ? ((currentImpressions - prevImpressions) / prevImpressions) * 100 
      : 0;

    return {
      totalUsers,
      userGrowth: Math.round(userGrowth * 10) / 10,
      totalRevenue,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      activeAds,
      adsGrowth: Math.round(adsGrowth * 10) / 10,
      totalImpressions,
      impressionGrowth: Math.round(impressionGrowth * 10) / 10,
    };
  } catch (error) {
    console.error('Error getting admin dashboard stats:', error);
    throw error;
  }
}

async getAdminChartData(months: number = 6): Promise<any> {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get monthly impressions
    const monthlyImpressions = await db
      .select({
        month: sql<string>`TO_CHAR(${impressionsEvents.createdAt}, 'YYYY-MM')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(impressionsEvents)
      .where(gte(impressionsEvents.createdAt, startDate))
      .groupBy(sql`TO_CHAR(${impressionsEvents.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${impressionsEvents.createdAt}, 'YYYY-MM')`);

    // Get monthly clicks
    const monthlyClicks = await db
      .select({
        month: sql<string>`TO_CHAR(${clicksEvents.createdAt}, 'YYYY-MM')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(clicksEvents)
      .where(gte(clicksEvents.createdAt, startDate))
      .groupBy(sql`TO_CHAR(${clicksEvents.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${clicksEvents.createdAt}, 'YYYY-MM')`);

    // Merge data
    const impressionMap = new Map(
      monthlyImpressions.map(d => [d.month, Number(d.count)])
    );
    const clickMap = new Map(
      monthlyClicks.map(d => [d.month, Number(d.count)])
    );

    // Create array for all months in range
    const chartData: any[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);

      chartData.push({
        date: monthStr,
        impressions: impressionMap.get(monthStr) || 0,
        clicks: clickMap.get(monthStr) || 0,
      });
    }

    return chartData;
  } catch (error) {
    console.error('Error getting admin chart data:', error);
    throw error;
  }
}

async getAdminRecentActivity(limit: number = 10): Promise<any> {
  try {
    const activities: any[] = [];

    // Get recent user signups
    const recentUsers = await db
      .select({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);

    recentUsers.forEach(user => {
      activities.push({
        id: user.id,
        type: 'user_signup',
        description: `New user registered: ${user.username}`,
        userId: user.id,
        username: user.username,
        createdAt: user.createdAt,
      });
    });

    // Get recent ads
    const recentAds = await db
      .select({
        id: ads.id,
        titleEn: ads.titleEn,
        status: ads.status,
        userId: ads.userId,
        createdAt: ads.createdAt,
      })
      .from(ads)
      .leftJoin(users, eq(ads.userId, users.id))
      .orderBy(desc(ads.createdAt))
      .limit(limit);

    recentAds.forEach(ad => {
      const typeMap = {
        'approved': 'ad_approved' as const,
        'rejected': 'ad_rejected' as const,
        'pending': 'ad_created' as const,
      };

      activities.push({
        id: ad.id,
        type: typeMap[ad.status] || 'ad_created',
        description: `Ad "${ad.titleEn}" ${ad.status}`,
        userId: ad.userId,
        createdAt: ad.createdAt,
      });
    });

    // Get recent purchases
    const recentPurchases = await db
      .select({
        id: purchases.id,
        amount: purchases.amount,
        userId: purchases.userId,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .leftJoin(users, eq(purchases.userId, users.id))
      .where(eq(purchases.status, "completed"))
      .orderBy(desc(purchases.createdAt))
      .limit(limit);

    recentPurchases.forEach(purchase => {
      activities.push({
        id: purchase.id,
        type: 'purchase',
        description: `Purchase completed: $${purchase.amount}`,
        userId: purchase.userId,
        createdAt: purchase.createdAt,
      });
    });

    // Sort all activities by date and limit
    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting admin recent activity:', error);
    throw error;
  }
}

async getSystemOverview(): Promise<any> {
  try {
    // Total users count
    const [totalUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    // Total ads count
    const [totalAds] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ads);

    // Pending ads count
    const [pendingAds] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(eq(ads.status, "pending"));

    // Active ads count
    const [activeAds] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(eq(ads.active, true));

    // Total impressions
    const [totalImpressions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(impressionsEvents);

    // Total clicks
    const [totalClicks] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clicksEvents);

    // Total revenue
    const [totalRevenue] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(${purchases.amount} AS DECIMAL)), 0)` 
      })
      .from(purchases)
      .where(eq(purchases.status, "completed"));

    return {
      totalUsers: Number(totalUsers.count || 0),
      totalAds: Number(totalAds.count || 0),
      pendingAds: Number(pendingAds.count || 0),
      activeAds: Number(activeAds.count || 0),
      totalImpressions: Number(totalImpressions.count || 0),
      totalClicks: Number(totalClicks.count || 0),
      totalRevenue: Number(totalRevenue.total || 0),
      ctr: Number(totalImpressions.count) > 0 
        ? (Number(totalClicks.count) / Number(totalImpressions.count)) * 100 
        : 0,
    };
  } catch (error) {
    console.error('Error getting system overview:', error);
    throw error;
  }
}
}