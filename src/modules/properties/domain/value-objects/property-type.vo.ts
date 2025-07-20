export class PropertyType {
  constructor(
    private readonly _category: string,
    private readonly _subtype: string,
  ) {
    if (!_category || _category.trim().length === 0) {
      throw new Error('Property category cannot be empty');
    }
    if (!_subtype || _subtype.trim().length === 0) {
      throw new Error('Property subtype cannot be empty');
    }
  }

  get category(): string {
    return this._category;
  }

  get subtype(): string {
    return this._subtype;
  }

  getFullType(): string {
    return `${this._category} - ${this._subtype}`;
  }

  isResidential(): boolean {
    return this._category.toLowerCase() === 'residential';
  }

  isCommercial(): boolean {
    return this._category.toLowerCase() === 'commercial';
  }

  equals(other: PropertyType): boolean {
    return (
      this._category === other._category && this._subtype === other._subtype
    );
  }
}
