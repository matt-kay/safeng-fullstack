import { UserIdentity } from '../entities/user-identity.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { UserStatus, UserRole } from '../value-objects/user-enums';

export class UserAggregate {
  constructor(
    private readonly _identity: UserIdentity,
    private readonly _profile: UserProfile | null = null,
  ) {}

  get uid(): string {
    return this._identity.uid;
  }

  get identity(): UserIdentity {
    return this._identity;
  }

  get profile(): UserProfile | null {
    return this._profile;
  }

  get profileExists(): boolean {
    return this._profile !== null;
  }

  get role(): UserRole | null {
    return this._profile?.role || null;
  }

  /**
   * Status & Authorization Semantics
   * 1. If `profile.status == "deleted"` → `"deleted"`
   * 2. Else if `profile.status == "suspended"` → `"suspended"`
   * 3. Else if `firebase.disabled == true` → `"inactive"`
   * 4. Else → `profile.status`
   */
  get effectiveStatus(): UserStatus {
    if (this._profile?.status === UserStatus.DELETED) {
      return UserStatus.DELETED;
    }
    if (this._profile?.status === UserStatus.SUSPENDED) {
      return UserStatus.SUSPENDED;
    }
    if (this._identity.disabled) {
      return UserStatus.INACTIVE;
    }
    if (this._profile) {
      return this._profile.status;
    }
    // Default to active if no profile yet but not disabled
    return UserStatus.ACTIVE;
  }

  /**
   * Determines if the user is considered soft-deleted
   */
  get isDeleted(): boolean {
    return this.effectiveStatus === UserStatus.DELETED;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  toJSON() {
    return {
      user: {
        uid: this.uid,
        identity: this._identity.toJSON(),
        profile: this._profile ? this._profile.toJSON() : null,
      },
      computed: {
        role: this.role,
        effective_status: this.effectiveStatus,
        profile_missing: !this.profileExists,
      },
    };
  }

  toSelfView() {
    const json = this._profile ? this._profile.toJSON() : null;
    return {
      uid: this.uid,
      identity: {
        uid: this.uid,
        phone_number: this._identity.phoneNumber.value,
        display_name: this._identity.displayName,
      },
      profile: json,
      profile_missing: !this.profileExists,
    };
  }

  toAdminView() {
    return this.toJSON();
  }
}
