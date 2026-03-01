import { PhoneNumber } from '../value-objects/phone-number.value-object';

export interface UserIdentityProps {
    uid: string;
    phoneNumber: PhoneNumber;
    displayName?: string | null;
    claims?: Record<string, string> | null;
    disabled?: boolean;
    creationTimestamp?: Date | null;
    lastRefreshTimestamp?: Date | null;
    lastSignInTimestamp?: Date | null;
}

export class UserIdentity {
    constructor(private readonly props: UserIdentityProps) { }

    get uid(): string {
        return this.props.uid;
    }

    get phoneNumber(): PhoneNumber {
        return this.props.phoneNumber;
    }

    get displayName(): string | null {
        return this.props.displayName || null;
    }

    get claims(): Record<string, string> | null {
        return this.props.claims || null;
    }

    get disabled(): boolean {
        return !!this.props.disabled;
    }

    get creationTimestamp(): Date | null {
        return this.props.creationTimestamp || null;
    }

    get lastRefreshTimestamp(): Date | null {
        return this.props.lastRefreshTimestamp || null;
    }

    get lastSignInTimestamp(): Date | null {
        return this.props.lastSignInTimestamp || null;
    }

    toJSON() {
        return {
            uid: this.uid,
            phone_number: this.phoneNumber.value,
            display_name: this.displayName,
            claims: this.claims,
            disabled: this.disabled,
            creation_timestamp: this.creationTimestamp,
            last_refresh_timestamp: this.lastRefreshTimestamp,
            last_sign_in_timestamp: this.lastSignInTimestamp,
        };
    }
}
