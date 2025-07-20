import { BaseEntity } from 'src/libs/ddd/base-entity.interface';

interface ContactProps {
  property_id: number; // REFERENCES properties(id) ON DELETE CASCADE
  phone?: string;
  email?: string;
}

export class Contact implements BaseEntity {
  private constructor(
    public readonly id: number,
    private _props: ContactProps,
  ) {}

  // Factory method for creating new contacts
  static create(
    id: number,
    propertyId: number,
    props: Omit<ContactProps, 'property_id'>,
  ): Contact {
    // Validation
    if (!props.phone && !props.email) {
      throw new Error(
        'At least one contact method (phone or email) must be provided',
      );
    }

    if (props.email && !Contact.isValidEmail(props.email)) {
      throw new Error('Invalid email format');
    }

    if (props.phone && !Contact.isValidPhone(props.phone)) {
      throw new Error('Invalid phone format');
    }

    return new Contact(id, {
      property_id: propertyId,
      ...props,
    });
  }

  // Factory method for reconstituting from persistence
  static fromPersistence(id: number, props: ContactProps): Contact {
    return new Contact(id, props);
  }

  // Getters
  get propertyId(): number {
    return this._props.property_id;
  }

  get phone(): string | undefined {
    return this._props.phone;
  }

  get email(): string | undefined {
    return this._props.email;
  }

  // Business methods
  updatePhone(phone: string): void {
    if (!Contact.isValidPhone(phone)) {
      throw new Error('Invalid phone format');
    }
    this._props.phone = phone;
  }

  updateEmail(email: string): void {
    if (!Contact.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    this._props.email = email;
  }

  hasContactMethod(): boolean {
    return !!(this._props.phone || this._props.email);
  }

  // Private validation methods
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    // Basic phone validation - adjust regex based on your requirements
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  // Get props for persistence
  getProps(): ContactProps {
    return { ...this._props };
  }
}
