import { Injectable } from '@nestjs/common';
import { eq, desc, sql, and, gte, lte, inArray } from 'drizzle-orm';
import { db } from '../../../../libs/database/db.connection';
import { 
  users, 
  socialMediaPages
} from '../../../../libs/database/drizzle.schema';
import { User } from '../../domain/entity/user.entity';
import { UserRepository as IUserRepository } from '../../domain/repository/user.repository.interface';
import { Collection } from '../../../../libs/api/rest/collection.interface';
import { PaginatedQueryParams } from '../../../../libs/api/rest/paginated-query-params.dto';

@Injectable()
export class UserRepository implements IUserRepository {
  
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
}