import { ICommand } from '@nestjs/cqrs';

export class AssignCreditCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly adId: string,
    public readonly credit: number,
  ) {}
}