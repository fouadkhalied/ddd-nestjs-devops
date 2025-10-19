import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MakeUserAdminCommand } from '../../command/make-user-admin.command';
import { UserRepository } from 'src/modules/user/domain/repository/user.repository.interface';
import { USER_REPOSITORY } from 'src/modules/user/user.tokens';

@CommandHandler(MakeUserAdminCommand)
export class MakeUserAdminHandler implements ICommandHandler<MakeUserAdminCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: MakeUserAdminCommand) {
    const user = await this.userRepository.makeUserAdmin(command.userId);
    
    if (!user) {
      throw new Error('User not found or update failed');
    }

    return user;
  }
}
