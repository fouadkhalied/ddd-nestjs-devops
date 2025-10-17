import { Injectable } from '@nestjs/common';
import { fromNullable, map, none, some, Option } from 'effect/Option';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { PaymentRepository, PurchaseHistoryResult, AdminPurchaseHistoryResult } from '../../../domain/repository/payment.repository.interface';
import { Payment, PaymentProps } from '../../../domain/entity/payment.entity';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentStatus } from '../../../domain/value-object/payment-status.enum';
import { PaginatedQueryParams } from '../../../../../libs/api/rest/paginated-query-params.dto';
import { purchases, users } from 'src/libs/database/drizzle.schema';
import { db } from 'src/libs/database/db.connection';

@Injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(private readonly mapper: PaymentMapper) {}

  async createPayment(data: PaymentProps): Promise<Option<Payment>> {
    try {
      const id = uuidv4();

      const [insertedPayment] = await db
        .insert(purchases)
        .values({
          id,
          userId: data.userId,
          amount: data.amount.toString(),
          currency: data.currency,
          method: data.method,
          status: data.status,
          stripeSessionId: data.stripeSessionId ?? null,
          stripePaymentIntentId: data.stripePaymentIntentId ?? null,
        })
        .returning();

      if (!insertedPayment) return none();

      return some(this.mapper.toDomain(insertedPayment));
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      return none();
    }
  }

  async findPaymentById(id: string): Promise<Option<Payment>> {
    try {
      const [record] = await db
        .select()
        .from(purchases)
        .where(eq(purchases.id, id))
        .limit(1);

      return map(fromNullable(record), (data) => this.mapper.toDomain(data));
    } catch (error) {
      console.error('❌ Error finding payment by id:', error);
      return none();
    }
  }

  async findPaymentBySessionId(sessionId: string): Promise<Option<Payment>> {
    try {
      const [record] = await db
        .select()
        .from(purchases)
        .where(eq(purchases.stripeSessionId, sessionId))
        .limit(1);

      return map(fromNullable(record), (data) => this.mapper.toDomain(data));
    } catch (error) {
      console.error('❌ Error finding payment by session id:', error);
      return none();
    }
  }

  async updatePaymentStatus(
    sessionId: string,
    status: PaymentStatus,
  ): Promise<Option<Payment>> {
    try {
      const result = await db.transaction(async (tx) => {
        // Find the payment
        const [payment] = await tx
          .select()
          .from(purchases)
          .where(eq(purchases.stripeSessionId, sessionId))
          .limit(1);

        if (!payment) {
          throw new Error('Payment not found');
        }

        // Update payment status
        const [updated] = await tx
          .update(purchases)
          .set({
            status,
            updatedAt: new Date(),
          })
          .where(eq(purchases.stripeSessionId, sessionId))
          .returning();

        // If changing from pending to completed, add balance
        if (payment.status === 'pending' && status === PaymentStatus.COMPLETED) {
          const amountToAdd = parseFloat(payment.amount);

          await tx
            .update(users)
            .set({
              balance: sql`${users.balance} + ${amountToAdd}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, payment.userId));

          console.log('✅ Balance added after status update', {
            userId: payment.userId,
            amountAdded: amountToAdd,
          });
        }

        return updated;
      });

      return map(fromNullable(result), (data) => this.mapper.toDomain(data));
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      return none();
    }
  }

  async updatePayment(
    id: string,
    data: Partial<PaymentProps>,
  ): Promise<Option<Payment>> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (data.status) updateData.status = data.status;
      if (data.stripePaymentIntentId) updateData.stripePaymentIntentId = data.stripePaymentIntentId;

      const [updated] = await db
        .update(purchases)
        .set(updateData)
        .where(eq(purchases.id, id))
        .returning();

      return map(fromNullable(updated), (record) =>
        this.mapper.toDomain(record),
      );
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      return none();
    }
  }

  async getUserBalance(userId: string): Promise<number> {
    try {
      const [user] = await db
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return user?.balance || 0;
    } catch (error) {
      console.error('❌ Error fetching user balance:', error);
      return 0;
    }
  }

  async getPurchaseHistory(
    userId: string,
    params: PaginatedQueryParams,
  ): Promise<PurchaseHistoryResult> {
    try {
      const offset = ((params.offset ?? 0) / (params.limit ?? 10)) * (params.limit ?? 10);
      const limit = params.limit ?? 10;
      const page = Math.floor(offset / limit) + 1;

      const [items, totalCount, userBalance] = await Promise.all([
        // Get purchases for user
        db
          .select()
          .from(purchases)
          .where(eq(purchases.userId, userId))
          .orderBy(sql`${purchases.createdAt} DESC`)
          .limit(limit)
          .offset(offset),

        // Get total count
        db
          .select({ count: sql<number>`count(*)` })
          .from(purchases)
          .where(eq(purchases.userId, userId))
          .then((res) => Number(res[0].count)),

        // Get user balance
        db
          .select({ balance: users.balance })
          .from(users)
          .where(eq(users.id, userId))
          .then((res) => Number(res[0]?.balance ?? 0)),
      ]);

      const payments = items.map((item) => this.mapper.toDomain(item));

      return {
        balance: userBalance,
        items: payments,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      console.error('❌ Error fetching purchase history:', error);
      throw error;
    }
  }

  async getPurchaseHistoryForAdmin(
    params: PaginatedQueryParams,
  ): Promise<AdminPurchaseHistoryResult> {
    try {
      const offset = ((params.offset ?? 0) / (params.limit ?? 10)) * (params.limit ?? 10);
      const limit = params.limit ?? 10;
      const page = Math.floor(offset / limit) + 1;

      const [rows, totalCount, totals, balanceSum] = await Promise.all([
        // Get all purchases
        db
          .select()
          .from(purchases)
          .orderBy(sql`${purchases.createdAt} DESC`)
          .limit(limit)
          .offset(offset),

        // Get total count
        db
          .select({ count: sql<number>`count(*)` })
          .from(purchases)
          .then((res) => Number(res[0].count)),

        // Get totals: last month & last year
        db.execute<{
          last_month: string;
          last_year: string;
        }>(sql`
          SELECT
            COALESCE(SUM(CASE WHEN "created_at" >= now() - interval '1 month' THEN amount END), 0) AS last_month,
            COALESCE(SUM(CASE WHEN "created_at" >= now() - interval '1 year' THEN amount END), 0) AS last_year
          FROM purchases
          WHERE status = 'completed'
        `),

        // Get sum of user balances
        db.execute<{ total_balance: string }>(sql`
          SELECT COALESCE(SUM(balance), 0) AS total_balance
          FROM users
        `),
      ]);

      const payments = rows.map((row) => this.mapper.toDomain(row));

      return {
        totalPaidLastMonth: Number(totals.rows?.[0]?.last_month ?? 0),
        totalPaidLastYear: Number(totals.rows?.[0]?.last_year ?? 0),
        totalUserBalance: Number(balanceSum.rows?.[0]?.total_balance ?? 0),
        items: payments,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      console.error('❌ Error fetching admin purchase history:', error);
      throw error;
    }
  }
}