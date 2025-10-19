export class GetUsersQuery {
    constructor(
      public readonly params: { page: number; limit: number },
    ) {}
  }