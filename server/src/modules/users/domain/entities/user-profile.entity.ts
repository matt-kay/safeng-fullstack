import { PhoneNumber } from '../value-objects/phone-number.value-object';
import { UserRole, UserStatus } from '../value-objects/user-enums';

export interface UserProfileProps {
    uid: string;
    firstName: string;
    lastName: string;
    phoneNumber: PhoneNumber;
    role: UserRole;
    status: UserStatus;
    email?: string | null;
    fcmTokens?: string[] | null;
    apnTokens?: string[] | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    deletedBy?: string | null;
    deletedReason?: string | null;
}

export class UserProfile {
    constructor(private readonly props: UserProfileProps) { }

    get uid(): string {
        return this.props.uid;
    }

    get firstName(): string {
        return this.props.firstName;
    }

    get lastName(): string {
        return this.props.lastName;
    }

    get phoneNumber(): PhoneNumber {
        return this.props.phoneNumber;
    }

    get role(): UserRole {
        return this.props.role;
    }

    get status(): UserStatus {
        return this.props.status;
    }

    get email(): string | null {
        return this.props.email || null;
    }

    get fcmTokens(): string[] {
        return this.props.fcmTokens || [];
    }

    get apnTokens(): string[] {
        return this.props.apnTokens || [];
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    get deletedAt(): Date | null {
        return this.props.deletedAt || null;
    }

    get deletedBy(): string | null {
        return this.props.deletedBy || null;
    }

    get deletedReason(): string | null {
        return this.props.deletedReason || null;
    }

    toJSON() {
        return {
            uid: this.uid,
            first_name: this.firstName,
            last_name: this.lastName,
            email: this.email,
            phone_number: this.phoneNumber.value,
            role: this.role,
            status: this.status,
            fcm_tokens: this.fcmTokens,
            apn_tokens: this.apnTokens,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            deleted_at: this.deletedAt,
            deleted_by: this.deletedBy,
            deleted_reason: this.deletedReason,
        };
    }
}
