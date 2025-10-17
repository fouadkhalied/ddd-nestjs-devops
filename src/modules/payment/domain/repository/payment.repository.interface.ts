import { Option } from 'effect/Option';
import { Payment, PaymentProps } from '../entity/payment.entity';
import { PaymentStatus } from '../value-object/payment-status.enum';
import { PaginatedQueryParams } from '../../../../libs/api/rest/paginated-query-params.dto';

export interface PurchaseHistoryResult {
  balance: number;
  items: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminPurchaseHistoryResult {
  totalPaidLastMonth: number;
  totalPaidLastYear: number;
  totalUserBalance: number;
  items: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentRepository {
  createPayment(data: PaymentProps): Promise<Option<Payment>>;
  
  findPaymentById(id: string): Promise<Option<Payment>>;
  
  findPaymentBySessionId(sessionId: string): Promise<Option<Payment>>;
  
  updatePaymentStatus(
    sessionId: string,
    status: PaymentStatus,
  ): Promise<Option<Payment>>;
  
  updatePayment(
    id: string,
    data: Partial<PaymentProps>,
  ): Promise<Option<Payment>>;
  
  getUserBalance(userId: string): Promise<number>;
  
  getPurchaseHistory(
    userId: string,
    params: PaginatedQueryParams,
  ): Promise<PurchaseHistoryResult>;
  
  getPurchaseHistoryForAdmin(
    params: PaginatedQueryParams,
  ): Promise<AdminPurchaseHistoryResult>;
}