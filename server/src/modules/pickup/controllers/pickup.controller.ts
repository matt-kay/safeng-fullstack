import { Controller, Get, Query, ParseFloatPipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PickupService, PickupRecommendation } from '../services/pickup.service';

@ApiTags('pickup')
@Controller('pickup')
export class PickupController {
    constructor(private readonly pickupService: PickupService) { }

    @Get('recommend')
    @ApiOperation({ summary: 'Get safer pickup recommendations within a radius' })
    @ApiQuery({ name: 'city', example: 'Lagos' })
    @ApiQuery({ name: 'lat', type: Number })
    @ApiQuery({ name: 'lng', type: Number })
    @ApiQuery({ name: 'radius_m', type: Number, required: false })
    @ApiResponse({ status: 200, description: 'Safer pickup points suggestions.' })
    async recommend(
        @Query('city') city: string,
        @Query('lat', ParseFloatPipe) lat: number,
        @Query('lng', ParseFloatPipe) lng: number,
        @Query('radius_m', new ParseIntPipe({ optional: true })) radiusM: number = 500,
    ): Promise<PickupRecommendation[]> {
        return this.pickupService.recommend(city, lat, lng, radiusM);
    }
}
