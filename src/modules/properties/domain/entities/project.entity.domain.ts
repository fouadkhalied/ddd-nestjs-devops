import { BaseEntity } from 'src/libs/ddd/base-entity.interface';

// Project Entity
interface ProjectProps {
  name: string;
  developer_id: number; // REFERENCES developers(id)
  location_id: number; // REFERENCES locations(id)
}

export class Project implements BaseEntity {
  private constructor(
    public readonly id: number,
    private _props: ProjectProps,
  ) {}

  // Factory method for creating new projects
  static create(
    id: number,
    name: string,
    developerId: number,
    locationId: number,
  ): Project {
    if (!name || name.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }

    if (name.length > 255) {
      throw new Error('Project name cannot exceed 255 characters');
    }

    if (developerId <= 0) {
      throw new Error('Developer ID must be positive');
    }

    if (locationId <= 0) {
      throw new Error('Location ID must be positive');
    }

    return new Project(id, {
      name: name.trim(),
      developer_id: developerId,
      location_id: locationId,
    });
  }

  // Factory method for reconstituting from persistence
  static fromPersistence(id: number, props: ProjectProps): Project {
    return new Project(id, props);
  }

  // Getters
  get name(): string {
    return this._props.name;
  }

  get developerId(): number {
    return this._props.developer_id;
  }

  get locationId(): number {
    return this._props.location_id;
  }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }

    if (name.length > 255) {
      throw new Error('Project name cannot exceed 255 characters');
    }

    this._props.name = name.trim();
  }

  updateDeveloper(developerId: number): void {
    if (developerId <= 0) {
      throw new Error('Developer ID must be positive');
    }

    this._props.developer_id = developerId;
  }

  updateLocation(locationId: number): void {
    if (locationId <= 0) {
      throw new Error('Location ID must be positive');
    }

    this._props.location_id = locationId;
  }

  // Business logic
  belongsToDeveloper(developerId: number): boolean {
    return this._props.developer_id === developerId;
  }

  isInLocation(locationId: number): boolean {
    return this._props.location_id === locationId;
  }

  // Get props for persistence
  getProps(): ProjectProps {
    return { ...this._props };
  }
}
