import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../auth.tokens';
import { IAuthRepository } from '../../domain/repositories/user.repository.interface';

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
