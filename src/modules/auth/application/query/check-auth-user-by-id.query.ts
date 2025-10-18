import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../auth.tokens';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';
import { CheckAuthUserByIdQuery } from '../command/query/check-auth-user-by-id.query';

@QueryHandler(CheckAuthUserByIdQuery)
export class CheckAuthUserByIdHandler implements IQueryHandler<CheckAuthUserByIdQuery> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(query: CheckAuthUserByIdQuery): Promise<boolean> {
    return this.authRepository.isActiveUser(query.id);
  }
}
