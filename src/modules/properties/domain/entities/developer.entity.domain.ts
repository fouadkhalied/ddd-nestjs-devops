import { BaseEntity } from 'src/libs/ddd/base-entity.interface';

// Developer Entity
interface DeveloperProps {
  name: string;
}

export class Developer implements BaseEntity {
  private constructor(
    public readonly id: number,
    private _props: DeveloperProps,
  ) {}

  // Factory method for creating new developers
  static create(id: number, name: string): Developer {
    if (!name || name.trim().length === 0) {
      throw new Error('Developer name cannot be empty');
    }

    if (name.length > 255) {
      throw new Error('Developer name cannot exceed 255 characters');
    }

    return new Developer(id, { name: name.trim() });
  }

  // Factory method for reconstituting from persistence
  static fromPersistence(id: number, props: DeveloperProps): Developer {
    return new Developer(id, props);
  }

  // Getters
  get name(): string {
    return this._props.name;
  }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Developer name cannot be empty');
    }

    if (name.length > 255) {
      throw new Error('Developer name cannot exceed 255 characters');
    }

    this._props.name = name.trim();
  }

  // Get props for persistence
  getProps(): DeveloperProps {
    return { ...this._props };
  }
}
