import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'property_types' })
export class PropertyTypeEntity {
  @PrimaryKey()
  id: string = v4();

  @Property({ unique: true })
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  icon?: string;

  @Property({ default: true })
  isActive!: boolean;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;
}
