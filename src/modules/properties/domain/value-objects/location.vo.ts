// Location Value Object
export class Location {
  constructor(
    private readonly _country: string,
    private readonly _governorate: string,
    private readonly _area: string,
    private readonly _district: string,
  ) {
    if (!_country || _country.trim().length === 0) {
      throw new Error('Country cannot be empty');
    }
    if (!_governorate || _governorate.trim().length === 0) {
      throw new Error('Governorate cannot be empty');
    }
    if (!_area || _area.trim().length === 0) {
      throw new Error('Area cannot be empty');
    }
    if (!_district || _district.trim().length === 0) {
      throw new Error('District cannot be empty');
    }
  }

  get country(): string {
    return this._country;
  }

  get governorate(): string {
    return this._governorate;
  }

  get area(): string {
    return this._area;
  }

  get district(): string {
    return this._district;
  }

  getFullAddress(): string {
    return `${this._district}, ${this._area}, ${this._governorate}, ${this._country}`;
  }

  equals(other: Location): boolean {
    return (
      this._country === other._country &&
      this._governorate === other._governorate &&
      this._area === other._area &&
      this._district === other._district
    );
  }
}
