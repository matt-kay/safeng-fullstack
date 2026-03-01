import { UserAggregate } from '../aggregates/user.aggregate';
import { UserStatus } from '../value-objects/user-enums';

export class UserAccessPolicy {
  constructor(private readonly user: UserAggregate) {}

  canAccessSelfEndpoints(): boolean {
    const status = this.user.effectiveStatus;
    // INACTIVE users can read themselves, ACTIVE can do everything
    return status === UserStatus.ACTIVE || status === UserStatus.INACTIVE;
  }

  canWriteSelf(): boolean {
    // INACTIVE cannot write/patch themselves. Only ACTIVE.
    return this.user.effectiveStatus === UserStatus.ACTIVE;
  }

  canAccessAdminEndpoints(): boolean {
    if (!this.user.isAdmin()) return false;
    const status = this.user.effectiveStatus;
    // Admins must be active to perform admin actions
    return status === UserStatus.ACTIVE;
  }
}
