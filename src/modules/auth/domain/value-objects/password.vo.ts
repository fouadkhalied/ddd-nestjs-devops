import { ValueObject } from "src/libs/ddd/value-object.abstract";

interface PasswordProps {
    value: string;
    hashed: boolean;
  }
  
  export class Password extends ValueObject<PasswordProps> {
    get value(): string {
      return this.props.value;
    }
  
    get isHashed(): boolean {
      return this.props.hashed;
    }
  
    static create(password: string, hashed: boolean = false): Password {
      if (!hashed && !this.isValid(password)) {
        throw new Error('Password must be at least 8 characters long');
      }
      return new Password({ value: password, hashed });
    }
  
    private static isValid(password: string): boolean {
      return password.length >= 8;
    }
  }
  