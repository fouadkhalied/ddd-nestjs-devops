import { IEvent } from '@nestjs/cqrs';
import { Ad } from '../entity/ad.entity';

export class AdCreatedEvent implements IEvent {
  constructor(
    public readonly ad: Ad,
    public readonly correlationId?: string,
  ) {}
}
