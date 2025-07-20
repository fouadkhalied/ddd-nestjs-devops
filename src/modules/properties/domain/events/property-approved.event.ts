import { DomainEvent } from 'src/libs/ddd/domain-event.abstract';
import { IEvent } from '@nestjs/cqrs';

// Event payload interface - what data the event carries
interface PropertyapprovedPayload {
  propertyId: string;
  mlsId: string;
  approvedAt: Date;
}

export class PropertyapprovedEvent
  extends DomainEvent<PropertyapprovedPayload>
  implements IEvent
{
  constructor(propertyId: string, mlsId: string, approvedAt: Date) {
    const payload: PropertyapprovedPayload = { propertyId, mlsId, approvedAt };
    super('Propertyapproved', payload);
  }

  // Convenient getters for accessing payload data
  get propertyId(): string {
    return this.payload.propertyId;
  }

  get mlsId(): string {
    return this.payload.mlsId;
  }

  get approvedAt(): Date {
    return this.payload.approvedAt;
  }
}
