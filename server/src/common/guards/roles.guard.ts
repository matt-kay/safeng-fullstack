import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { IUserRepository } from '../../modules/users/domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../modules/users/domain/repositories/user-repository.interface';
import { UserAccessPolicy } from '../../modules/users/domain/policies/user-access.policy';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const uid = request.user?.uid;
    // FirebaseAuthGuard runs before this, so uid should exist if not public
    if (!uid) {
      throw new ForbiddenException('User is not authenticated');
    }

    const aggregate = await this.userRepository.findById(uid);
    if (!aggregate) {
      throw new ForbiddenException('Identity not found');
    }

    // Attach full user aggregate to request for controllers to use
    request.user.aggregate = aggregate;

    const policy = new UserAccessPolicy(aggregate);
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.includes('admin')) {
      if (!policy.canAccessAdminEndpoints()) {
        throw new ForbiddenException('Admin access required');
      }
      return true;
    }

    // Default: Must have a profile unless explicitly handled inside self endpoints
    // If no roles specified, it's a generic protected endpoint
    if (!aggregate.profileExists) {
      // Exclude profile creation/fetch endpoints from this strict check based on route matching,
      // Or handle inside the controller. Usually `RolesGuard` is just for "has role".
      // But we will use the generic `policy.canAccessSelfEndpoints` check.
    }

    // Block completely suspended/deleted from doing anything authenticated except endpoints they strictly shouldn't reach
    if (!policy.canAccessSelfEndpoints()) {
      throw new ForbiddenException('Account suspended or deleted');
    }

    return true;
  }
}
