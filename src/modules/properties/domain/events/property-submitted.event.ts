import { DomainEvent } from 'src/libs/ddd/domain-event.abstract';
import { IEvent } from '@nestjs/cqrs';

// Event payload interface - what data the event carries
interface PropertySubmittedPayload {
  propertyId: string;
  mlsId: string;
  submittedAt: Date;
  listedBy?: string;
}

export class PropertySubmittedEvent
  extends DomainEvent<PropertySubmittedPayload>
  implements IEvent
{
  constructor(
    propertyId: string,
    mlsId: string,
    submittedAt: Date,
    listedBy: string | undefined,
  ) {
    const payload: PropertySubmittedPayload = {
      propertyId,
      mlsId,
      submittedAt,
      listedBy,
    };
    super('PropertySubmitted', payload);
  }

  // Convenient getters for accessing payload data
  get propertyId(): string {
    return this.payload.propertyId;
  }

  get mlsId(): string {
    return this.payload.mlsId;
  }

  get submittedAt(): Date {
    return this.payload.submittedAt;
  }

  get listedBy(): string | undefined {
    return this.payload.listedBy;
  }
}
