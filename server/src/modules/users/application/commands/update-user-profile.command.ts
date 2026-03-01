import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../domain/repositories/user-repository.interface';
import { UserAccessPolicy } from '../../domain/policies/user-access.policy';

export class UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Injectable()
export class UpdateUserProfileCommand {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(uid: string, dto: UpdateUserProfileDto): Promise<any> {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Empty update payload');
    }

    const aggregate = await this.userRepository.findById(uid);
    if (!aggregate || !aggregate.profileExists) {
      throw new NotFoundException('Profile not found');
    }

    const policy = new UserAccessPolicy(aggregate);
    if (!policy.canWriteSelf()) {
      throw new ForbiddenException(
        'User status does not permit profile updates',
      );
    }

    const updateData: any = {};
    if (dto.firstName) updateData.first_name = dto.firstName.trim();
    if (dto.lastName) updateData.last_name = dto.lastName.trim();
    if (dto.email !== undefined) updateData.email = dto.email;

    await this.userRepository.updateProfile(uid, updateData);

    if (dto.firstName || dto.lastName) {
      try {
        const firstName = dto.firstName
          ? dto.firstName.trim()
          : aggregate.profile!.firstName;
        const lastName = dto.lastName
          ? dto.lastName.trim()
          : aggregate.profile!.lastName;

        await this.userRepository.updateIdentity(uid, {
          displayName: `${firstName} ${lastName}`,
        });
      } catch (e) {
        // Best effort
      }
    }

    const updated = await this.userRepository.findById(uid);
    return updated!.toSelfView();
  }
}
