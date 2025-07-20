// MLS ID Value Object
export class MlsId {
  constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('MLS ID cannot be empty');
    }
    if (_value.length > 50) {
      throw new Error('MLS ID cannot exceed 50 characters');
    }
    if (!this.isValidFormat(_value)) {
      throw new Error('MLS ID format is invalid');
    }
  }

  get value(): string {
    return this._value;
  }

  private isValidFormat(value: string): boolean {
    // Basic alphanumeric validation - adjust regex based on your MLS ID format
    const mlsRegex = /^[A-Za-z0-9\-_]+$/;
    return mlsRegex.test(value);
  }

  equals(other: MlsId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
