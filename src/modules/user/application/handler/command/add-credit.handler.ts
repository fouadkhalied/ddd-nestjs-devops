import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddCreditCommand } from '../../command/add-credit.command';
import { USER_REPOSITORY } from 'src/modules/user/user.tokens';
import { UserRepository } from 'src/modules/user/infrastructure/persistence/user.repository';
@CommandHandler(AddCreditCommand)
export class AddCreditHandler implements ICommandHandler<AddCreditCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: AddCreditCommand) {
    const { userId, credit } = command;

    const success = await this.userRepository.addCreditToUser(userId, credit);

    if (!success) {
      throw new Error('Failed to add credit');
    }

    return { success: true, message: 'Credit added successfully' };
  }
}