import { UserAccessPolicy } from './user-access.policy';
import { UserAggregate } from '../aggregates/user.aggregate';
import { UserIdentity } from '../entities/user-identity.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import { UserRole, UserStatus } from '../value-objects/user-enums';

describe('UserAccessPolicy', () => {
  let baseProps: any;
  let baseIdentity: UserIdentity;

  beforeEach(() => {
    baseProps = {
      uid: 'test-uid',
      phoneNumber: PhoneNumber.create('+2348012345678'),
      displayName: 'Test User',
      claims: {},
      disabled: false,
      creationTimestamp: new Date(),
      lastRefreshTimestamp: new Date(),
      lastSignInTimestamp: new Date(),
    };
    baseIdentity = new UserIdentity(baseProps);
  });

  describe('canAccessSelfEndpoints', () => {
    it('should allow active users', () => {
      const aggregate = new UserAggregate(baseIdentity);
      const policy = new UserAccessPolicy(aggregate);
      expect(policy.canAccessSelfEndpoints()).toBe(true);
    });

    it('should allow inactive users (disabled in firebase)', () => {
      const inactiveIdentity = new UserIdentity({
        ...baseProps,
        disabled: true,
      });
      const aggregate = new UserAggregate(inactiveIdentity);
      const policy = new UserAccessPolicy(aggregate);
      expect(policy.canAccessSelfEndpoints()).toBe(true);
    });

    it('should block suspended users', () => {
      const profile = new UserProfile({
        uid: 'test-uid',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: PhoneNumber.create('+2348012345678'),
        role: UserRole.CUSTOMER,
        status: UserStatus.SUSPENDED,
        createdAt: new Date(),
      } as any);
      const aggregate = new UserAggregate(baseIdentity, profile);
      const policy = new UserAccessPolicy(aggregate);
      expect(policy.canAccessSelfEndpoints()).toBe(false);
    });

    it('should block deleted users', () => {
      const profile = new UserProfile({
        uid: 'test-uid',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: PhoneNumber.create('+2348012345678'),
        role: UserRole.CUSTOMER,
        status: UserStatus.DELETED,
        createdAt: new Date(),
      } as any);
      const aggregate = new UserAggregate(baseIdentity, profile);
      const policy = new UserAccessPolicy(aggregate);
      expect(policy.canAccessSelfEndpoints()).toBe(false);
    });
  });

  describe('canWriteSelf', () => {
    it('should allow active users', () => {
      const aggregate = new UserAggregate(baseIdentity);
      const policy = new UserAccessPolicy(aggregate);
      expect(policy.canWriteSelf()).toBe(true);
    });

    it('should block inactive users from writing themselves', () => {
      const inactiveIdentity = new UserIdentity({
        ...baseProps,
        disabled: true,
      });
      const aggregate = new UserAggregate(inactiveIdentity);
      const policy = new UserAccessPolicy(aggregate);
      expect(policy.canWriteSelf()).toBe(false);
    });
  });

  describe('canAccessAdminEndpoints', () => {
    it('should block non-admins even if active', () => {
      const profile = new UserProfile({
        uid: 'test-uid',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: PhoneNumber.create('+2348012345678'),
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
      } as any);
      const aggregate = new UserAggregate(baseIdentity, profile);
      const policy = new UserAccessPolicy(aggregate);
      expect(policy.canAccessAdminEndpoints()).toBe(false);
    });

    it('should allow active admins', () => {
      const profile = new UserProfile({
        uid: 'test-uid',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: PhoneNumber.create('+2348012345678'),
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
      } as any);
      const aggregate = new UserAggregate(baseIdentity, profile);
      const policy = new UserAccessPolicy(aggregate);
      expect(policy.canAccessAdminEndpoints()).toBe(true);
    });

    it('should block inactive admins', () => {
      const inactiveIdentity = new UserIdentity({
        ...baseProps,
        disabled: true,
      });
      const profile = new UserProfile({
        uid: 'test-uid',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: PhoneNumber.create('+2348012345678'),
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
      } as any);
      const aggregate = new UserAggregate(inactiveIdentity, profile);
      const policy = new UserAccessPolicy(aggregate);
      expect(policy.canAccessAdminEndpoints()).toBe(false);
    });
  });
});
