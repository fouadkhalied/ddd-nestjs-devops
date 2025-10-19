import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminDashboardStatsQuery } from '../../query/get-admin-dashboard-stats.query';
import { USER_REPOSITORY } from 'src/modules/user/user.tokens';
import { UserRepository } from 'src/modules/user/infrastructure/persistence/user.repository';

@QueryHandler(GetAdminDashboardStatsQuery)
export class GetAdminDashboardStatsHandler implements IQueryHandler<GetAdminDashboardStatsQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetAdminDashboardStatsQuery) {
    const { days } = query;

    const stats = await this.userRepository.getAdminDashboardStats(days);
    const chartData = await this.userRepository.getAdminChartData(days);
    const recentActivity = await this.userRepository.getAdminRecentActivity(10);
    const systemOverview = await this.userRepository.getSystemOverview();

    return {
      stats,
      chartData,
      recentActivity,
      systemOverview,
    };
  }
}