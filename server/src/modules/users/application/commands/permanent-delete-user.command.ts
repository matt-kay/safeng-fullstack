import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../domain/repositories/user-repository.interface';
import { UserAccessPolicy } from '../../domain/policies/user-access.policy';

export interface PermanentDeleteUserDto {
  reason?: string;
  alsoDeleteProfile?: boolean;
}

@Injectable()
export class PermanentDeleteUserCommand {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    targetUid: string,
    callerUid: string,
    dto?: PermanentDeleteUserDto,
  ): Promise<void> {
    const caller = await this.userRepository.findById(callerUid);
    if (!caller) {
      throw new NotFoundException('Caller not found');
    }

    const policy = new UserAccessPolicy(caller);
    if (!policy.canAccessAdminEndpoints()) {
      throw new ForbiddenException('Admin access required');
    }

    const alsoDeleteProfile = dto?.alsoDeleteProfile !== false; // defaults to true

    // We attempt permanent delete directly. If the target Firebase Auth user is not found,
    // the repository will ignore the error, but still scrub/delete from Firestore.
    await this.userRepository.permanentDelete(targetUid, alsoDeleteProfile);
  }
}
