import { Module } from '@nestjs/common';
import { UsersController } from './presentation/controllers/users.controller';
import { AdminUsersController } from './presentation/controllers/admin-users.controller';

import { GetUserProfileQuery } from './application/queries/get-user-profile.query';
import { CreateUserProfileCommand } from './application/commands/create-user-profile.command';
import { UpdateUserProfileCommand } from './application/commands/update-user-profile.command';
import { SoftDeleteUserCommand } from './application/commands/soft-delete-user.command';
import { PermanentDeleteUserCommand } from './application/commands/permanent-delete-user.command';

import { UserRepository } from './infrastructure/repositories/user.repository';
import { AuditLoggingDecorator } from './infrastructure/decorators/audit-logging.decorator';
import { USER_REPOSITORY_TOKEN } from './domain/repositories/user-repository.interface';
import { FirebaseService } from '../../infrastructure/firebase/firebase.service';

@Module({
  controllers: [UsersController, AdminUsersController],
  providers: [
    // Provide the actual repository but don't export it directly using the token yet.
    UserRepository,
    {
      provide: USER_REPOSITORY_TOKEN,
      useFactory: (repo: UserRepository, firebaseService: FirebaseService) => {
        return new AuditLoggingDecorator(repo, firebaseService);
      },
      inject: [UserRepository, FirebaseService],
    },
    GetUserProfileQuery,
    CreateUserProfileCommand,
    UpdateUserProfileCommand,
    SoftDeleteUserCommand,
    PermanentDeleteUserCommand,
  ],
  exports: [USER_REPOSITORY_TOKEN],
})
export class UsersModule {}
