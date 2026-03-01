import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripService } from '../services/trip.service';
import { StartTripDto, BatchTelemetryDto, EndTripDto } from '../dto/trip.dto';
import { createHash } from 'crypto';

import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';

@ApiTags('Trip Guard')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) { }

  @Post('start')
  @ApiOperation({ summary: 'Start a new trip and get route analysis' })
  async startTrip(@Body() dto: StartTripDto, @Req() req: any) {
    const userIdHash = this.hashUserId(req.user.uid);
    return this.tripService.startTrip(userIdHash, dto);
  }

  @Post('telemetry')
  @ApiOperation({ summary: 'Send batch telemetry points for an active trip' })
  async sendTelemetry(@Body() dto: BatchTelemetryDto, @Req() req: any) {
    const userIdHash = this.hashUserId(req.user.uid);
    // Authorization check happens in service/repository to ensure trip belongs to user
    return this.tripService.processTelemetry(userIdHash, dto);
  }

  @Post('end')
  @ApiOperation({ summary: 'End an active trip' })
  async endTrip(@Body() dto: EndTripDto, @Req() req: any) {
    const userIdHash = this.hashUserId(req.user.uid);
    return this.tripService.endTrip(userIdHash, dto.tripId);
  }

  private hashUserId(uid: string): string {
    return createHash('sha256').update(uid).digest('hex');
  }
}
