import { ICommand } from '@nestjs/cqrs';

export class RejectAdCommand implements ICommand {
  constructor(
    readonly adId: string,
    readonly reason?: string,
  ) {}
}
