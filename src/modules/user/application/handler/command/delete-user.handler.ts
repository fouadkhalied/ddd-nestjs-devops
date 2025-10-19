import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserRepository } from 'src/modules/user/infrastructure/persistence/user.repository';
import { DeleteUserCommand } from '../../command/delete-user.command';
import { USER_REPOSITORY } from 'src/modules/user/user.tokens';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: DeleteUserCommand) {
    const deleted = await this.userRepository.deleteUser(command.userId);

    if (!deleted) {
      throw new Error('User not found or deletion failed');
    }

    return { success: true };
  }
}