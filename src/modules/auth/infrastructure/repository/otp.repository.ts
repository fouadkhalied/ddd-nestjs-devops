import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { IOtpRepository, OtpRecord } from '../../domain/repositories/otp.repository.interface';
import { db } from 'src/libs/database/db.connection';
import { otps } from 'src/libs/database/drizzle.schema';

@Injectable()
export class OtpRepository implements IOtpRepository {
  async create(data: Omit<OtpRecord, 'id' | 'createdAt'>): Promise<OtpRecord> {
    const [otp] = await db
      .insert(otps)
      .values({
        id: `${data.otpCode}:${data.email}`,
        otpCode: data.otpCode,
        type: data.type,
        expiresAt: data.expiresAt,
        used: data.used,
        email: data.email,
      })
      .returning();

    return this.mapToOtpRecord(otp);
  }

  async findByEmailAndType(email: string, type: string): Promise<OtpRecord | null> {
    const [otp] = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.email, email),
          eq(otps.type, type),
          eq(otps.used, false),
        ),
      )
      .orderBy(otps.createdAt)
      .limit(1);

    return otp ? this.mapToOtpRecord(otp) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await db
      .update(otps)
      .set({ used: true })
      .where(eq(otps.id, id));
  }

  async deleteByEmail(email: string, type: string): Promise<boolean> {
    const result = await db
      .delete(otps)
      .where(
        and(
          eq(otps.email, email),
          eq(otps.type, type),
        ),
      )
      .returning();

    return result.length > 0;
  }

  private mapToOtpRecord(data: any): OtpRecord {
    return {
      id: data.id,
      otpCode: data.otpCode,
      type: data.type,
      expiresAt: data.expiresAt,
      used: data.used,
      email: data.email,
      createdAt: data.createdAt,
    };
  }
}