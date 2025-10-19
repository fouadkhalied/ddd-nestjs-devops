import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetDashboardStatsQuery } from '../../query/get-dashboard-stats.query';
import { USER_REPOSITORY } from 'src/modules/user/user.tokens';
import { UserRepository } from 'src/modules/user/domain/repository/user.repository.interface';


@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler implements IQueryHandler<GetDashboardStatsQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetDashboardStatsQuery) {
    const { userId, days } = query;

    const stats = await this.userRepository.getDashboardStats(userId, days);
    const chartData = await this.userRepository.getChartData(userId, days);
    const topAds = await this.userRepository.getTopPerformingAds(userId, 3);
    const activity = await this.userRepository.getRecentActivity(userId, 10);

    return {
      stats,
      chartData,
      topAds,
      activity,
    };
  }
}