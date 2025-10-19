import { Option } from 'effect/Option';
import { Collection } from '../../../../libs/api/rest/collection.interface';
import { PaginatedQueryParams } from '../../../../libs/api/rest/paginated-query-params.dto';
import { User, UserProps } from '../entity/user.entity';

export interface UserRepository {
  createUser(data: UserProps): Promise<Option<User>>;
  getUserByEmail(email: string): Promise<Option<User>>;
  getUserById(id: string): Promise<Option<User>>;
  checkActiveUserById(id: string): Promise<boolean>;
  getAllUsers<T extends PaginatedQueryParams>(params?: T): Promise<Collection<User>>;
  updateUser(id: string, updates: Partial<any>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  makeUserAdmin(id: string): Promise<User | null>;
  addCreditToUser(userId: string, credit: number): Promise<boolean>;
  
  // Dashboard methods
  getDashboardStats(userId: string, days: number): Promise<any>;
  getChartData(userId: string, days: number): Promise<any>;
  getTopPerformingAds(userId: string, limit: number): Promise<any>;
  getRecentActivity(userId: string, limit: number): Promise<any>;
  getAdminDashboardStats(days: number): Promise<any>;
  getAdminChartData(months: number): Promise<any>;
  getAdminRecentActivity(limit: number): Promise<any>;
  getSystemOverview(): Promise<any>;
}
