// Action Value Object
export class Action {
  constructor(private readonly _name: string) {
    if (!_name || _name.trim().length === 0) {
      throw new Error('Action name cannot be empty');
    }
    if (_name.length > 100) {
      throw new Error('Action name cannot exceed 100 characters');
    }
  }

  get name(): string {
    return this._name;
  }

  equals(other: Action): boolean {
    return this._name === other._name;
  }
}
