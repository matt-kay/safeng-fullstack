import { UserAggregate } from '../aggregates/user.aggregate';
import { UserIdentity } from '../entities/user-identity.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import * as admin from 'firebase-admin';
import { UserRole, UserStatus } from '../value-objects/user-enums';

export class UserAggregateBuilder {
  private identity: UserIdentity | null = null;
  private profile: UserProfile | null = null;

  withFirebaseRecord(record: admin.auth.UserRecord): this {
    this.identity = new UserIdentity({
      uid: record.uid,
      phoneNumber: PhoneNumber.create(record.phoneNumber!),
      displayName: record.displayName,
      claims: record.customClaims as Record<string, string>,
      disabled: record.disabled,
      creationTimestamp: record.metadata.creationTime
        ? new Date(record.metadata.creationTime)
        : null,
      lastRefreshTimestamp: record.tokensValidAfterTime
        ? new Date(record.tokensValidAfterTime)
        : null,
      lastSignInTimestamp: record.metadata.lastSignInTime
        ? new Date(record.metadata.lastSignInTime)
        : null,
    });
    return this;
  }

  withFirestoreProfile(doc: admin.firestore.DocumentSnapshot): this {
    if (doc.exists) {
      const data = doc.data()!;
      this.profile = new UserProfile({
        uid: doc.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phoneNumber: PhoneNumber.create(data.phone_number),
        role: data.role as UserRole,
        status: data.status as UserStatus,
        fcmTokens: data.fcm_tokens,
        apnTokens: data.apn_tokens,
        createdAt: data.created_at?.toDate(),
        updatedAt: data.updated_at?.toDate(),
        deletedAt: data.deleted_at?.toDate(),
        deletedBy: data.deleted_by,
        deletedReason: data.deleted_reason,
      });
    }
    return this;
  }

  build(): UserAggregate {
    if (!this.identity) {
      throw new Error(
        'UserIdentity (Firebase Record) is required to build a UserAggregate',
      );
    }
    return new UserAggregate(this.identity, this.profile);
  }
}
