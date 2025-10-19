export class GetDashboardStatsQuery {
    constructor(
      public readonly userId: string,
      public readonly days: number,
    ) {}
  }