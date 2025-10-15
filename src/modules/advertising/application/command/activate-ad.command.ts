import { ICommand } from '@nestjs/cqrs';

export class ActivateAdCommand implements ICommand {
  constructor(readonly adId: string) {}
}
