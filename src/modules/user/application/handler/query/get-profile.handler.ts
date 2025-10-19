import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProfileQuery } from '../../query/get-profile.query';
import { USER_REPOSITORY } from 'src/modules/user/user.tokens';
import { UserRepository } from 'src/modules/user/infrastructure/persistence/user.repository';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetProfileQuery) {
    const user = await this.userRepository.getUserById(query.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.props.email,
      firstName: user.props.firstName,
      lastName: user.props.lastName,
      role: user.props.role,
      state: user.props.state,
      createdAt: user.props.createdAt,
    };
  }
}