import { Injectable, Logger } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { UserAggregateBuilder } from '../../domain/builders/user-aggregate.builder';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { UserStatus } from '../../domain/value-objects/user-enums';
import * as admin from 'firebase-admin';

@Injectable()
export class UserRepository implements IUserRepository {
    private readonly logger = new Logger(UserRepository.name);
    private readonly PROFILES_COLLECTION = 'profiles';

    constructor(private readonly firebaseService: FirebaseService) { }

    async findById(uid: string): Promise<UserAggregate | null> {
        try {
            const authRecord = await this.firebaseService.auth.getUser(uid);
            const profileDoc = await this.firebaseService.firestore.collection(this.PROFILES_COLLECTION).doc(uid).get();

            const builder = new UserAggregateBuilder();
            return builder
                .withFirebaseRecord(authRecord)
                .withFirestoreProfile(profileDoc)
                .build();
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                return null;
            }
            this.logger.error(`Error finding user by ID: ${uid}`, error.stack);
            throw error;
        }
    }

    async saveProfile(aggregate: UserAggregate): Promise<void> {
        const profile = aggregate.profile;
        if (!profile) {
            throw new Error('Cannot save empty profile');
        }

        const data = profile.toJSON();
        // Convert Dates to Firestore Timestamps
        const firestoreData = {
            ...data,
            created_at: admin.firestore.Timestamp.fromDate(data.created_at),
            updated_at: admin.firestore.Timestamp.fromDate(data.updated_at),
            deleted_at: data.deleted_at ? admin.firestore.Timestamp.fromDate(data.deleted_at) : null,
        };

        await this.firebaseService.firestore
            .collection(this.PROFILES_COLLECTION)
            .doc(profile.uid)
            .set(firestoreData, { merge: true });
    }

    async updateProfile(uid: string, data: Partial<any>): Promise<void> {
        const updateData = {
            ...data,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        await this.firebaseService.firestore
            .collection(this.PROFILES_COLLECTION)
            .doc(uid)
            .update(updateData);
    }

    async softDelete(uid: string, params?: { reason?: string; deletedBy?: string }): Promise<void> {
        await this.firebaseService.firestore.runTransaction(async (transaction) => {
            const docRef = this.firebaseService.firestore.collection(this.PROFILES_COLLECTION).doc(uid);
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;

            transaction.update(docRef, {
                status: UserStatus.DELETED,
                deleted_at: admin.firestore.FieldValue.serverTimestamp(),
                deleted_by: params?.deletedBy || null,
                deleted_reason: params?.reason || null,
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        // Best effort Firebase updates
        try {
            await this.firebaseService.auth.updateUser(uid, { disabled: true });
            await this.revokeTokens(uid);
        } catch (error) {
            this.logger.error(`Failed to disable Firebase Auth for soft-deleted user ${uid}`, error);
        }
    }

    async permanentDelete(uid: string, alsoDeleteProfile: boolean): Promise<void> {
        try {
            await this.firebaseService.auth.deleteUser(uid);
        } catch (error: any) {
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }

        if (alsoDeleteProfile) {
            await this.firebaseService.firestore.collection(this.PROFILES_COLLECTION).doc(uid).delete();
        } else {
            // Scrub PII
            await this.updateProfile(uid, {
                first_name: '[DELETED]',
                last_name: '[DELETED]',
                email: null,
                phone_number: '[DELETED]',
                fcm_tokens: [],
                apn_tokens: [],
            });
        }
    }

    async updateIdentity(uid: string, properties: admin.auth.UpdateRequest): Promise<void> {
        await this.firebaseService.auth.updateUser(uid, properties);
    }

    async revokeTokens(uid: string): Promise<void> {
        await this.firebaseService.auth.revokeRefreshTokens(uid);
    }

    async list(options: {
        limit?: number;
        status?: string;
        role?: string;
        cursor?: string
    }): Promise<{ items: UserAggregate[]; nextCursor: string | null }> {
        let query: admin.firestore.Query = this.firebaseService.firestore.collection(this.PROFILES_COLLECTION);

        if (options.status) {
            query = query.where('status', '==', options.status);
        }
        if (options.role) {
            query = query.where('role', '==', options.role);
        }

        query = query.orderBy('created_at', 'desc');
        const limit = options.limit || 50;
        query = query.limit(limit);

        if (options.cursor) {
            const cursorDoc = await this.firebaseService.firestore.collection(this.PROFILES_COLLECTION).doc(options.cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        }

        const snapshot = await query.get();

        // In a real application, we might want to batch fetch auth records or avoid hydrating all via Firebase
        // For this implementation, we map over and fetch the Identity
        const items: UserAggregate[] = [];
        for (const doc of snapshot.docs) {
            const aggregate = await this.findById(doc.id);
            if (aggregate) items.push(aggregate);
        }

        const nextCursor = snapshot.docs.length === limit ? snapshot.docs[snapshot.docs.length - 1].id : null;

        return { items, nextCursor };
    }
}
