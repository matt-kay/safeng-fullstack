import { UserAggregate } from '../aggregates/user.aggregate';

export interface IUserRepository {
    /**
     * Finds a user by their Firebase Auth UID.
     * Returns a fully assembled UserAggregate or null if the identity does not exist.
     */
    findById(uid: string): Promise<UserAggregate | null>;

    /**
     * Saves or updates a user profile to the database.
     * Note: Identity is managed by Firebase Auth and generally not "saved" here unless syncing.
     */
    saveProfile(aggregate: UserAggregate): Promise<void>;

    /**
     * Updates only specific fields on the profile.
     */
    updateProfile(uid: string, data: Partial<any>): Promise<void>;

    /**
     * Soft deletes the user profile and updates statuses.
     */
    softDelete(uid: string, params?: { reason?: string; deletedBy?: string }): Promise<void>;

    /**
     * Permanently deletes a user from identity and database.
     */
    permanentDelete(uid: string, alsoDeleteProfile: boolean): Promise<void>;

    /**
     * Updates the Firebase Identity custom claims or properties
     */
    updateIdentity(uid: string, properties: Partial<any>): Promise<void>;

    /**
     * Revokes refresh tokens for the given uid.
     */
    revokeTokens(uid: string): Promise<void>;

    /**
     * Lists users (primarily for admin UI).
     */
    list(options: {
        limit?: number;
        status?: string;
        role?: string;
        cursor?: string
    }): Promise<{ items: UserAggregate[]; nextCursor: string | null }>;
}

export const USER_REPOSITORY_TOKEN = Symbol('USER_REPOSITORY_TOKEN');
