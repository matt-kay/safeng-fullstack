import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../domain/repositories/user-repository.interface';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import * as admin from 'firebase-admin';

export enum AuditAction {
  PROFILE_UPDATE = 'profile_update',
  SOFT_DELETE = 'soft_delete',
  PERMANENT_DELETE = 'permanent_delete',
  REVOKE_TOKENS = 'revoke_tokens',
  RESTORE = 'restore',
}

@Injectable()
export class AuditLoggingDecorator implements IUserRepository {
  private readonly logger = new Logger(AuditLoggingDecorator.name);
  private readonly AUDIT_COLLECTION = 'user_audit_logs';

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly innerRepository: IUserRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async findById(uid: string): Promise<UserAggregate | null> {
    return this.innerRepository.findById(uid);
  }

  async saveProfile(aggregate: UserAggregate): Promise<void> {
    return this.innerRepository.saveProfile(aggregate);
  }

  async updateProfile(
    uid: string,
    data: Partial<any>,
    actorUid?: string,
  ): Promise<void> {
    await this.innerRepository.updateProfile(uid, data);
    this.logActionAsync(
      AuditAction.PROFILE_UPDATE,
      actorUid || uid,
      uid,
      'Profile updated',
      null,
      data,
    );
  }

  async softDelete(
    uid: string,
    params?: { reason?: string; deletedBy?: string },
  ): Promise<void> {
    await this.innerRepository.softDelete(uid, params);
    this.logActionAsync(
      AuditAction.SOFT_DELETE,
      params?.deletedBy || uid,
      uid,
      params?.reason || 'Soft deletion',
    );
  }

  async permanentDelete(
    uid: string,
    alsoDeleteProfile: boolean,
    actorUid?: string,
  ): Promise<void> {
    await this.innerRepository.permanentDelete(uid, alsoDeleteProfile);
    this.logActionAsync(
      AuditAction.PERMANENT_DELETE,
      actorUid || 'system',
      uid,
      `Permanent delete (alsoDeleteProfile: ${alsoDeleteProfile})`,
    );
  }

  async updateIdentity(
    uid: string,
    properties: admin.auth.UpdateRequest,
    actorUid?: string,
  ): Promise<void> {
    await this.innerRepository.updateIdentity(uid, properties);
    this.logActionAsync(
      AuditAction.PROFILE_UPDATE,
      actorUid || uid,
      uid,
      'Identity properties updated',
      null,
      properties,
    );
  }

  async revokeTokens(
    uid: string,
    actorUid?: string,
    reason?: string,
  ): Promise<void> {
    await this.innerRepository.revokeTokens(uid);
    this.logActionAsync(
      AuditAction.REVOKE_TOKENS,
      actorUid || uid,
      uid,
      reason || 'Tokens revoked',
    );
  }

  async list(options: any) {
    return this.innerRepository.list(options);
  }

  private logActionAsync(
    action: AuditAction,
    actorUid: string,
    targetUid: string,
    reason?: string,
    before?: any,
    after?: any,
  ) {
    // Fire and forget
    this.firebaseService.firestore
      .collection(this.AUDIT_COLLECTION)
      .add({
        action,
        actor_uid: actorUid,
        target_uid: targetUid,
        reason: reason || null,
        before: before || null,
        after: after || null,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      })
      .catch((err) => {
        this.logger.error(
          `Failed to write audit log for action: ${action}`,
          err,
        );
      });
  }
}
