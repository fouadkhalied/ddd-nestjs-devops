import { IEvent } from '@nestjs/cqrs';

export class AdApprovedEvent implements IEvent {
  constructor(public readonly ad: any) {}
}
