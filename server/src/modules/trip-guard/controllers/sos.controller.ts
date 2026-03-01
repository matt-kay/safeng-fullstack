import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripService } from '../services/trip.service';
import { TriggerSosDto } from '../dto/trip.dto';
import { createHash } from 'crypto';

import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';

@ApiTags('Trip Guard')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('sos')
export class SosController {
  constructor(private readonly tripService: TripService) { }

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger a silent SOS alert' })
  async triggerSos(@Body() dto: TriggerSosDto, @Req() req: any) {
    const userIdHash = this.hashUserId(req.user.uid);
    return this.tripService.triggerSos(userIdHash, dto);
  }

  private hashUserId(uid: string): string {
    return createHash('sha256').update(uid).digest('hex');
  }
}
