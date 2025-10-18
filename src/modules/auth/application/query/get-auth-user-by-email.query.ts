import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { AUTH_REPOSITORY } from '../../auth.tokens';
import { none, Option, some } from 'effect/Option';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';
import { GetAuthUserByEmailQuery } from '../command/query/get-auth-user-by-email.query';

@QueryHandler(GetAuthUserByEmailQuery)
export class GetAuthUserByEmailHandler implements IQueryHandler<GetAuthUserByEmailQuery> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(query: GetAuthUserByEmailQuery): Promise<Option<User>> {
    const user = await this.authRepository.findByEmail(query.email);
    return user ? some(user) : none();
  }
}