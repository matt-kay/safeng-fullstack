import { Controller, Get, Post, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { VerifiedStatus } from '../../incidents/entities/incident.entity';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/domain/value-objects/user-enums';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('overview')
    @ApiOperation({ summary: 'Get system overview stats' })
    async getOverview() {
        return this.adminService.getOverview();
    }

    @Get('incidents')
    @ApiOperation({ summary: 'List incidents with filtering' })
    @ApiQuery({ name: 'status', enum: VerifiedStatus, required: false })
    async getIncidents(
        @Query('status') status?: VerifiedStatus,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.adminService.getIncidents(status, limit, offset);
    }

    @Post('incidents/:id/verify')
    @ApiOperation({ summary: 'Verify an incident report' })
    @ApiResponse({ status: 200, description: 'Incident verified.' })
    async verifyIncident(@Param('id', ParseUUIDPipe) id: string) {
        return this.adminService.verifyIncident(id);
    }
}
