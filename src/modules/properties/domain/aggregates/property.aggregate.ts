import { AggregateRoot } from '@nestjs/cqrs';
import { PropertySubmittedEvent } from '../events/property-submitted.event';
import { PropertyapprovedEvent } from '../events/property-approved.event';

interface PropertyProps {
  mlsId: string;
  projectId?: string; // Changed from number to string for UUID
  propertyTypeId?: string; // Changed from number to string for UUID
  building?: string;
  floor?: number;
  unit?: string;
  priceAmount?: number;
  priceCurrency?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  yearBuilt?: number;
  description?: string;
  listingType?: string;
  imagesCount: number;
  listedBy?: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Property extends AggregateRoot {
  protected id: string;
  protected props: PropertyProps;
  constructor(id: string, props: PropertyProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(
    id: string,
    props: Omit<PropertyProps, 'approved' | 'createdAt' | 'updatedAt'>,
  ): Property {
    const property = new Property(id, {
      ...props,
      approved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    property.apply(
      new PropertySubmittedEvent(id, props.mlsId, new Date(), props.listedBy),
    );
    return property;
  }

  // Getters
  get _id(): string {
    return this.id;
  }

  get mlsId(): string {
    return this.props.mlsId;
  }

  get isApproved(): boolean {
    return this.props.approved;
  }

  get priceAmount(): number | undefined {
    return this.props.priceAmount;
  }

  get priceCurrency(): string | undefined {
    return this.props.priceCurrency;
  }

  approve(): void {
    if (this.props.approved) {
      throw new Error('Property is already approved');
    }

    this.props.approved = true;
    this.props.updatedAt = new Date();

    this.apply(
      new PropertyapprovedEvent(this.id, this.props.mlsId, new Date()),
    );
  }

  updatePrice(amount: number, currency: string): void {
    if (amount <= 0) {
      throw new Error('Price must be positive');
    }

    this.props.priceAmount = amount;
    this.props.priceCurrency = currency;
    this.props.updatedAt = new Date();
  }

  updateImagesCount(count: number): void {
    if (count < 0) {
      throw new Error('Images count cannot be negative');
    }

    this.props.imagesCount = count;
    this.props.updatedAt = new Date();
  }
}
