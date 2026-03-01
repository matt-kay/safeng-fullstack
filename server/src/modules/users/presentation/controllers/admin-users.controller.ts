import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../domain/value-objects/user-enums';
import { SoftDeleteUserCommand } from '../../application/commands/soft-delete-user.command';
import { PermanentDeleteUserCommand } from '../../application/commands/permanent-delete-user.command';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../domain/repositories/user-repository.interface';
import { Inject } from '@nestjs/common';
import { RolesGuard } from '../../../../common/guards/roles.guard';

@ApiTags('admin/users')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('api/v1/admin/users')
export class AdminUsersController {
  constructor(
    private readonly softDeleteUserCommand: SoftDeleteUserCommand,
    private readonly permanentDeleteUserCommand: PermanentDeleteUserCommand,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async listUsers(
    @Query('status') status?: string,
    @Query('role') role?: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    const options = {
      status,
      role,
      limit: limit ? Number(limit) : undefined,
      cursor,
    };
    const { items, nextCursor } = await this.userRepository.list(options);
    return {
      items: items.map((agg) => agg.toAdminView()),
      next_cursor: nextCursor,
    };
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Admin specific update to a user profile (e.g., set status)',
  })
  async updateUser(@Param('uid') uid: string, @Body() body: any) {
    await this.userRepository.updateProfile(uid, body);
    const updated = await this.userRepository.findById(uid);
    return updated!.toAdminView();
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Admin soft delete a user' })
  async softDeleteUser(
    @Req() request: any,
    @Param('uid') targetUid: string,
    @Body() body: any,
  ) {
    const callerUid = request.user.uid;
    await this.softDeleteUserCommand.execute(targetUid, callerUid, true, {
      reason: body?.reason,
    });
  }

  @Delete(':uid/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Admin permanently delete a user (scrub)' })
  async permanentDeleteUser(
    @Req() request: any,
    @Param('uid') targetUid: string,
    @Body() body: any,
  ) {
    const callerUid = request.user.uid;
    const alsoDeleteProfile = body?.alsoDeleteProfile !== false;
    await this.permanentDeleteUserCommand.execute(targetUid, callerUid, {
      reason: body?.reason,
      alsoDeleteProfile,
    });
  }
}
