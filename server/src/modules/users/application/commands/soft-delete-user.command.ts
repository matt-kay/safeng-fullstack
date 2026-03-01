import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../domain/repositories/user-repository.interface';
import { UserAccessPolicy } from '../../domain/policies/user-access.policy';

export interface SoftDeleteUserDto {
    reason?: string;
}

@Injectable()
export class SoftDeleteUserCommand {
    constructor(
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository,
    ) { }

    async execute(targetUid: string, callerUid: string, isAdmin: boolean = false, dto?: SoftDeleteUserDto): Promise<void> {
        const caller = await this.userRepository.findById(callerUid);
        if (!caller) {
            throw new NotFoundException('Caller not found');
        }

        const isSelfDelete = callerUid === targetUid;

        if (!isSelfDelete && !isAdmin) {
            const policy = new UserAccessPolicy(caller);
            if (!policy.canAccessAdminEndpoints()) {
                throw new ForbiddenException('Admin access required');
            }
        }

        const targetUser = await this.userRepository.findById(targetUid);
        if (!targetUser || !targetUser.profileExists) {
            if (isSelfDelete) throw new NotFoundException('Profile not found');
            else return; // Idempotent or 404
        }

        if (targetUser.isDeleted) {
            return; // Already deleted
        }

        await this.userRepository.softDelete(targetUid, {
            reason: dto?.reason,
            deletedBy: isSelfDelete ? callerUid : 'admin',
        });
    }
}
