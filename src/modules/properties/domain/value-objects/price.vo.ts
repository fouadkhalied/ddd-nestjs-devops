// Price Value Object
export class Price {
  constructor(
    private readonly _amount: number,
    private readonly _currency: string,
  ) {
    if (_amount < 0) {
      throw new Error('Price amount cannot be negative');
    }
    if (!_currency || _currency.trim().length === 0) {
      throw new Error('Currency cannot be empty');
    }
    if (!this.isValidCurrency(_currency)) {
      throw new Error(`Invalid currency: ${_currency}`);
    }
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  private isValidCurrency(currency: string): boolean {
    const validCurrencies = ['USD', 'EUR', 'EGP', 'AED', 'SAR', 'QAR'];
    return validCurrencies.includes(currency.toUpperCase());
  }

  isInCurrency(currency: string): boolean {
    return this.currency.toUpperCase() === currency.toUpperCase();
  }

  equals(other: Price): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  toString(): string {
    return `${this._amount} ${this._currency}`;
  }
}
