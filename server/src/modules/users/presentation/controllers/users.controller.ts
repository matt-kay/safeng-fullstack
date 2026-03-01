import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { GetUserProfileQuery } from '../../application/queries/get-user-profile.query';
import {
  CreateUserProfileCommand,
  CreateUserProfileDto,
} from '../../application/commands/create-user-profile.command';
import {
  UpdateUserProfileCommand,
  UpdateUserProfileDto,
} from '../../application/commands/update-user-profile.command';
import { SoftDeleteUserCommand } from '../../application/commands/soft-delete-user.command';

@ApiTags('users')
@ApiBearerAuth()
@Controller('api/v1')
export class UsersController {
  constructor(
    private readonly getUserProfileQuery: GetUserProfileQuery,
    private readonly createUserProfileCommand: CreateUserProfileCommand,
    private readonly updateUserProfileCommand: UpdateUserProfileCommand,
    private readonly softDeleteUserCommand: SoftDeleteUserCommand,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get caller profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile missing' })
  async getMe(@Req() request: any) {
    const uid = request.user.uid;
    return this.getUserProfileQuery.execute(uid, uid);
  }

  @Post('users/profile')
  @ApiOperation({ summary: 'Create a new user profile' })
  @ApiResponse({ status: 201, description: 'Profile created' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  async createProfile(@Req() request: any, @Body() body: CreateUserProfileDto) {
    const uid = request.user.uid;
    return this.createUserProfileCommand.execute(uid, body);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update caller profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(@Req() request: any, @Body() body: UpdateUserProfileDto) {
    const uid = request.user.uid;
    return this.updateUserProfileCommand.execute(uid, body);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete caller profile' })
  @ApiResponse({ status: 204, description: 'Profile deleted' })
  async deleteMe(@Req() request: any, @Body() body: any) {
    const uid = request.user.uid;
    await this.softDeleteUserCommand.execute(uid, uid, false, {
      reason: body?.reason,
    });
  }

  @Get('users/:uid')
  @ApiOperation({ summary: 'Get user by UID' })
  async getUserById(@Req() request: any, @Param('uid') targetUid: string) {
    const callerUid = request.user.uid;
    const aggregate = request.user.aggregate;
    const isAdmin = aggregate?.isAdmin() || false;
    return this.getUserProfileQuery.execute(targetUid, callerUid, isAdmin);
  }
}
