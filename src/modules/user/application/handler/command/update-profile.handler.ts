// src/modules/user/application/command/update-profile.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../user.tokens';
import { UserRepository } from '../../../infrastructure/persistence/user.repository';
import { UpdateProfileCommand } from '../../command/update-profile.command';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateProfileCommand) {
    const { userId, username, password, country } = command;

    const updates: any = {};
    if (username) updates.username = username;
    if (password) updates.password = password;
    if (country) updates.country = country;

    const updatedUser = await this.userRepository.updateUser(userId, updates);

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }
}