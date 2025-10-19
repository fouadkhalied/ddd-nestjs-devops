import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserQuery } from '../../query/get-user.query';
import { USER_REPOSITORY } from 'src/modules/user/user.tokens';
import { UserRepository } from 'src/modules/user/infrastructure/persistence/user.repository';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUserQuery) {
    const user = await this.userRepository.getUserById(query.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}