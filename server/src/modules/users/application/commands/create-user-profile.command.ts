import { Inject, Injectable, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../domain/repositories/user-repository.interface';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { PhoneNumber } from '../../domain/value-objects/phone-number.value-object';
import { UserRole, UserStatus } from '../../domain/value-objects/user-enums';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';

export class CreateUserProfileDto {
    firstName: string;
    lastName: string;
    email?: string;
}

@Injectable()
export class CreateUserProfileCommand {
    constructor(
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository,
    ) { }

    async execute(uid: string, dto: CreateUserProfileDto): Promise<any> {
        const aggregate = await this.userRepository.findById(uid);
        if (!aggregate) {
            throw new UnprocessableEntityException('Firebase identity not found');
        }

        if (aggregate.profileExists) {
            throw new ConflictException('Profile already exists');
        }

        const now = new Date();
        const profile = new UserProfile({
            uid: uid,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            email: dto.email,
            phoneNumber: aggregate.identity.phoneNumber,
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
        });

        const newAggregate = await this.userRepository.findById(uid); // Refresh
        // Hacky way to set profile for saving, usually we instantiate a new aggregate
        // But since UserAggregate properties are private readonly, we can just save the constructed profile and re-fetch.

        // Create new aggregate locally to save
        const aggregateToSave = new UserAggregate(aggregate.identity, profile);

        await this.userRepository.saveProfile(aggregateToSave);

        // Update Firebase display name best-effort
        try {
            await this.userRepository.updateIdentity(uid, {
                displayName: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
            });
        } catch (e) {
            // Best effort
        }

        const updated = await this.userRepository.findById(uid);
        return updated!.toSelfView();
    }
}
