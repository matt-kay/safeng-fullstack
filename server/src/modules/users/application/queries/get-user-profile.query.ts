import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../domain/repositories/user-repository.interface';
import { UserAccessPolicy } from '../../domain/policies/user-access.policy';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';

@Injectable()
export class GetUserProfileQuery {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    targetUid: string,
    callerUid: string,
    isAdmin: boolean = false,
  ): Promise<any> {
    const caller = await this.userRepository.findById(callerUid);
    if (!caller) {
      throw new NotFoundException('Caller identity not found');
    }

    if (callerUid === targetUid) {
      // Self request
      const policy = new UserAccessPolicy(caller);
      if (!policy.canAccessSelfEndpoints()) {
        throw new ForbiddenException('User status does not permit this action');
      }
      return caller.toSelfView();
    }

    // Admin request for another user
    if (!isAdmin) {
      const policy = new UserAccessPolicy(caller);
      if (!policy.canAccessAdminEndpoints()) {
        throw new NotFoundException('User not found'); // Reduce enumeration
      }
    }

    const targetUser = await this.userRepository.findById(targetUid);
    if (!targetUser || !targetUser.profileExists) {
      throw new NotFoundException('User not found');
    }

    return targetUser.toAdminView();
  }
}
