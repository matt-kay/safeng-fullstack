import { UserAggregate } from './user.aggregate';
import { UserIdentity } from '../entities/user-identity.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import { UserRole, UserStatus } from '../value-objects/user-enums';

describe('UserAggregate', () => {
    let baseProps: any;

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

    it('should return active status when no profile and not disabled', () => {
        const aggregate = new UserAggregate(baseIdentity);
        expect(aggregate.effectiveStatus).toBe(UserStatus.ACTIVE);
        expect(aggregate.isDeleted).toBe(false);
    });

    it('should return inactive status when disabled in firebase, even without profile', () => {
        const disabledIdentity = new UserIdentity({ ...baseProps, disabled: true });
        const aggregate = new UserAggregate(disabledIdentity);
        expect(aggregate.effectiveStatus).toBe(UserStatus.INACTIVE);
    });

    it('should return deleted status if profile is deleted, ignoring firebase disabled state', () => {
        const disabledIdentity = new UserIdentity({ ...baseProps, disabled: true });
        const profile = new UserProfile({
            uid: 'test-uid',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: PhoneNumber.create('+2348012345678'),
            role: UserRole.USER,
            status: UserStatus.DELETED,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);
        const aggregate = new UserAggregate(disabledIdentity, profile);
        expect(aggregate.effectiveStatus).toBe(UserStatus.DELETED);
        expect(aggregate.isDeleted).toBe(true);
    });

    it('should return suspended status if profile is suspended', () => {
        const profile = new UserProfile({
            uid: 'test-uid',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: PhoneNumber.create('+2348012345678'),
            role: UserRole.USER,
            status: UserStatus.SUSPENDED,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);
        const aggregate = new UserAggregate(baseIdentity, profile);
        expect(aggregate.effectiveStatus).toBe(UserStatus.SUSPENDED);
    });

    it('should return inactive status if profile is active but firebase is disabled', () => {
        const disabledIdentity = new UserIdentity({ ...baseProps, disabled: true });
        const profile = new UserProfile({
            uid: 'test-uid',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: PhoneNumber.create('+2348012345678'),
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);
        const aggregate = new UserAggregate(disabledIdentity, profile);
        expect(aggregate.effectiveStatus).toBe(UserStatus.INACTIVE);
    });

    it('should correctly determine if user is admin', () => {
        const profile = new UserProfile({
            uid: 'test-uid',
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: PhoneNumber.create('+2348012345678'),
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);
        const aggregate = new UserAggregate(baseIdentity, profile);
        expect(aggregate.isAdmin()).toBe(true);
    });

    it('should report correct profile missing flag in self view', () => {
        const aggregate = new UserAggregate(baseIdentity);
        const view = aggregate.toSelfView();
        expect(view.profile_missing).toBe(true);
        expect(view.profile).toBeNull();
    });
});
