export class PhoneNumber {
  private constructor(private readonly _value: string) {}

  static create(phoneNumber: string): PhoneNumber {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    const cleaned = phoneNumber.replace(/[\s-()]/g, '');

    // E.164 basic validation: + followed by 10 to 14 digits
    const e164Regex = /^\+[1-9]\d{10,14}$/;

    if (!e164Regex.test(cleaned)) {
      throw new Error(
        'Phone number must be in valid E.164 format (e.g., +1234567890)',
      );
    }

    return new PhoneNumber(cleaned);
  }

  get value(): string {
    return this._value;
  }

  equals(other: PhoneNumber): boolean {
    return this._value === other.value;
  }
}
