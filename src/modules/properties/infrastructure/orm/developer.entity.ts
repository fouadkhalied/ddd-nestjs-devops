import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'developers' })
export class DeveloperEntity {
  @PrimaryKey()
  id: string = v4();

  @Property({ unique: true })
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  website?: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ nullable: true })
  phone?: string;

  @Property({ nullable: true })
  address?: string;

  @Property({ nullable: true })
  city?: string;

  @Property({ nullable: true })
  country?: string;

  @Property({ nullable: true })
  logo?: string;

  @Property({ default: true })
  isActive!: boolean;

  @Property({ default: false })
  isVerified!: boolean;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  // Relationship with properties (if needed)
  // @OneToMany(() => PropertyEntity, property => property.developer)
  // properties = new Collection<PropertyEntity>(this);
}
