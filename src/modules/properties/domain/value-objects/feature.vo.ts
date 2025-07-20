// Feature Value Object
export class Feature {
  constructor(
    private readonly _name: string,
    private readonly _icon?: string,
  ) {
    if (!_name || _name.trim().length === 0) {
      throw new Error('Feature name cannot be empty');
    }
    if (_name.length > 100) {
      throw new Error('Feature name cannot exceed 100 characters');
    }
  }

  get name(): string {
    return this._name;
  }

  get icon(): string | undefined {
    return this._icon;
  }

  hasIcon(): boolean {
    return !!this._icon;
  }

  equals(other: Feature): boolean {
    return this._name === other._name && this._icon === other._icon;
  }
}
