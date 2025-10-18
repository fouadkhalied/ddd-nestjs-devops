import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { User } from '../../domain/entities/user.entity';
import { UserState } from '../../../user/domain/value-object/user-state.enum';
import { CreateUserDto, IAuthRepository } from '../../domain/repositories/user.repository.interface';
import { db } from 'src/libs/database/db.connection';
import { users } from 'src/libs/database/drizzle.schema';

@Injectable()
export class AuthRepository implements IAuthRepository {
  async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ? this.mapToEntity(user) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);

    return user ? this.mapToEntity(user) : null;
  }

  async findByFacebookId(facebookId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.facebookId, facebookId))
      .limit(1);

    return user ? this.mapToEntity(user) : null;
  }

  async create(data: CreateUserDto): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        password: data.password,
        username: data.username,
        oauth: data.oauth || 'normal',
        role: data.role || "user",
        verified: data.verified || false,
        googleId: data.googleId,
        facebookId: data.facebookId,
      })
      .returning();
      
    return this.mapToEntity(newUser);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return this.mapToEntity(updated);
  }

  async verifyUser(id: string): Promise<User> {
    const [verified] = await db
      .update(users)
      .set({ verified: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return this.mapToEntity(verified);
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ googleId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return this.mapToEntity(updated);
  }

  async linkFacebookAccount(userId: string, facebookId: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ facebookId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return this.mapToEntity(updated);
  }

  async isActiveUser(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user?.isActive() || false;
  }

  private mapToEntity(data: any): User {
    return User.create(data.id, {
      email: data.email,
      password: data.password,
      username: data.username,
      googleId: data.googleId,
      facebookId: data.facebookId,
      oauth: data.oauth,
      role: data.role,
      state: UserState.ACTIVE, // Map from your schema
      verified: data.verified,
      country: data.country,
      freeViewsCredits: data.freeViewsCredits,
      balance: data.balance,
      totalSpend: data.totalSpend,
      adsCount: data.adsCount,
      stripeCustomerId: data.stripeCustomerId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}