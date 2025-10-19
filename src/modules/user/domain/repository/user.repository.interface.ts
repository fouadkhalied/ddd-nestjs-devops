// src/modules/user/domain/repository/user.repository.interface.ts
// Replace document 71 with this complete interface

import { Collection } from '../../../../libs/api/rest/collection.interface';
import { PaginatedQueryParams } from '../../../../libs/api/rest/paginated-query-params.dto';
import { User, UserProps } from '../entity/user.entity';

export interface UserRepository {
  // Basic CRUD
  createUser(data: UserProps): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  checkActiveUserById(id: string): Promise<boolean>;
  getAllUsers<T extends PaginatedQueryParams>(params?: T): Promise<Collection<User>>;
  updateUser(id: string, updates: Partial<any>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  makeUserAdmin(id: string): Promise<User | null>;
  addCreditToUser(userId: string, credit: number): Promise<boolean>;
  
  // Dashboard methods for users
  getDashboardStats(userId: string, days: number): Promise<{
    totalImpressions: number;
    impressionGrowth: number;
    totalClicks: number;
    clickGrowth: number;
    clickThroughRate: number;
    ctrGrowth: number;
    remainingBalance: number;
    balanceGrowth: number;
  }>;
  
  getChartData(userId: string, days: number): Promise<Array<{
    date: string;
    clicks: number;
    impressions: number;
  }>>;
  
  getTopPerformingAds(userId: string, limit: number): Promise<Array<{
    id: string;
    titleEn: string;
    titleAr: string;
    imageUrl: string | null;
    impressions: number;
    clicks: number;
    ctr: number;
  }>>;
  
  getRecentActivity(userId: string, limit: number): Promise<Array<{
    id: string;
    adId: string;
    type: string;
    createdAt: Date;
    adTitle: string;
  }>>;
  
  // Dashboard methods for admin
  getAdminDashboardStats(days: number): Promise<{
    totalUsers: number;
    userGrowth: number;
    totalRevenue: number;
    revenueGrowth: number;
    activeAds: number;
    adsGrowth: number;
    totalImpressions: number;
  }>
}