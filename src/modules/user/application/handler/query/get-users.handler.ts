import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from '../../query/get-users.query';
import { USER_REPOSITORY } from 'src/modules/user/user.tokens';
import { UserRepository } from 'src/modules/user/infrastructure/persistence/user.repository';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUsersQuery) {
    return this.userRepository.getAllUsers(query.params);
  }
}