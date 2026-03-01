import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VehicleService } from '../services/vehicle.service';
import { CheckVehicleDto } from '../dto/check-vehicle.dto';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';

@ApiTags('Vehicle Matcher')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('vehicle')
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) { }

    @Post('check')
    @ApiOperation({ summary: 'Check a vehicle before boarding to get trust score and history' })
    @ApiResponse({ status: 201, description: 'Vehicle check results returned successfully.' })
    async checkVehicle(@Body() dto: CheckVehicleDto) {
        return this.vehicleService.checkVehicle(dto);
    }
}
