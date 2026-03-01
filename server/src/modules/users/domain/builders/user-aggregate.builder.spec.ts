import { UserAggregateBuilder } from './user-aggregate.builder';
import { UserAggregate } from '../aggregates/user.aggregate';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import { UserRole, UserStatus } from '../value-objects/user-enums';
import * as admin from 'firebase-admin';

describe('UserAggregateBuilder', () => {
    let mockFirebaseRecord: any;
    let mockFirestoreDoc: any;

    beforeEach(() => {
        mockFirebaseRecord = {
            uid: 'test-uid',
            phoneNumber: '+2348012345678',
            displayName: 'Bob Builder',
            customClaims: { role: 'admin' },
            disabled: false,
            metadata: {
                creationTime: new Date().toISOString(),
                lastSignInTime: new Date().toISOString(),
            },
            tokensValidAfterTime: new Date().toISOString(),
        } as unknown as admin.auth.UserRecord;

        mockFirestoreDoc = {
            exists: true,
            id: 'test-uid',
            data: () => ({
                first_name: 'Bob',
                last_name: 'Builder',
                phone_number: '+2348012345678',
                role: UserRole.ADMIN,
                status: UserStatus.ACTIVE,
            }),
        } as unknown as admin.firestore.DocumentSnapshot;
    });

    it('should throw an error if built without UserIdentity', () => {
        const builder = new UserAggregateBuilder();
        expect(() => builder.build()).toThrow('UserIdentity (Firebase Record) is required to build a UserAggregate');
    });

    it('should build successfully with only Firebase record (no profile)', () => {
        const builder = new UserAggregateBuilder();
        const aggregate = builder.withFirebaseRecord(mockFirebaseRecord).build();

        expect(aggregate).toBeInstanceOf(UserAggregate);
        expect(aggregate.uid).toBe('test-uid');
        expect(aggregate.profileExists).toBe(false);
        expect(aggregate.profile).toBeNull();
    });

    it('should build successfully with both Firebase record and Firestore profile', () => {
        const builder = new UserAggregateBuilder();
        const aggregate = builder
            .withFirebaseRecord(mockFirebaseRecord)
            .withFirestoreProfile(mockFirestoreDoc)
            .build();

        expect(aggregate.uid).toBe('test-uid');
        expect(aggregate.profileExists).toBe(true);
        expect(aggregate.role).toBe(UserRole.ADMIN);
        expect(aggregate.effectiveStatus).toBe(UserStatus.ACTIVE);
    });

    it('should ignore non-existent firestore documents', () => {
        const nonExistentDoc = {
            exists: false,
            id: 'test-uid',
            data: () => undefined,
        } as unknown as admin.firestore.DocumentSnapshot;

        const builder = new UserAggregateBuilder();
        const aggregate = builder
            .withFirebaseRecord(mockFirebaseRecord)
            .withFirestoreProfile(nonExistentDoc)
            .build();

        expect(aggregate.profileExists).toBe(false);
    });
});
