import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'projects' })
export class ProjectEntity {
  @PrimaryKey()
  id: string = v4();

  @Property({ unique: true })
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  developerId?: string;

  @Property({ nullable: true })
  location?: string;

  @Property({ nullable: true })
  city?: string;

  @Property({ nullable: true })
  country?: string;

  @Property({ nullable: true })
  address?: string;

  @Property({ nullable: true })
  totalUnits?: number;

  @Property({ nullable: true })
  availableUnits?: number;

  @Property({ nullable: true })
  projectType?: string; // RESIDENTIAL, COMMERCIAL, MIXED

  @Property({ nullable: true })
  status?: string; // PLANNING, UNDER_CONSTRUCTION, COMPLETED, SOLD_OUT

  @Property({ nullable: true })
  startDate?: Date;

  @Property({ nullable: true })
  completionDate?: Date;

  @Property({ nullable: true })
  minPrice?: number;

  @Property({ nullable: true })
  maxPrice?: number;

  @Property({ nullable: true })
  currency?: string;

  @Property({ nullable: true })
  images?: string[];

  @Property({ nullable: true })
  amenities?: string[];

  @Property({ default: true })
  isActive!: boolean;

  @Property({ default: false })
  isFeatured!: boolean;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  // Relationships (commented out for now)
  // @ManyToOne(() => DeveloperEntity)
  // developer?: DeveloperEntity;

  // @OneToMany(() => PropertyEntity, property => property.project)
  // properties = new Collection<PropertyEntity>(this);
}
