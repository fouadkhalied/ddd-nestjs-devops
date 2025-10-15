import { ICommand } from '@nestjs/cqrs';

export class DeactivateAdCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly adId: string,
  ) {}
}
