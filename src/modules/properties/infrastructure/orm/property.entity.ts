// infrastructure/entities/property.entity.ts
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'properties' })
export class PropertyEntity {
  @PrimaryKey()
  id!: string;

  @Property({ unique: true })
  mlsId!: string;

  @Property({ nullable: true })
  projectId?: string; // Changed from number to string for UUID

  @Property({ nullable: true })
  propertyTypeId?: string; // Changed from number to string for UUID

  @Property({ nullable: true })
  building?: string;

  @Property({ nullable: true })
  floor?: number;

  @Property({ nullable: true })
  unit?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceAmount?: number;

  @Property({ length: 3, nullable: true })
  priceCurrency?: string;

  @Property({ nullable: true })
  bedrooms?: number;

  @Property({ nullable: true })
  bathrooms?: number;

  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  areaSqm?: number;

  @Property({ nullable: true })
  yearBuilt?: number;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ nullable: true })
  listingType?: string;

  @Property({ default: 0 })
  imagesCount!: number;

  @Property({ nullable: true })
  listedBy?: string;

  @Property({ default: false })
  is_approved!: boolean;
}
