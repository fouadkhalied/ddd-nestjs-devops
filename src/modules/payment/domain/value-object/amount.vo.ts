export class Amount {
    private readonly _value: number;
  
    constructor(value: number) {
      if (value <= 0) {
        throw new Error('Amount must be positive');
      }
      this._value = value;
    }
  
    get value(): number {
      return this._value;
    }
  
    toNumber(): number {
      return this._value;
    }
  
    toCents(): number {
      return Math.round(this._value * 100);
    }
  
    toString(): string {
      return this._value.toString();
    }
  }