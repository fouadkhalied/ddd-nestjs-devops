import { ICommand } from '@nestjs/cqrs';

export class DeleteAdCommand implements ICommand {
  constructor(readonly adId: string) {}
}
