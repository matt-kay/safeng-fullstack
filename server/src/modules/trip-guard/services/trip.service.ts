import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { TripRepository } from '../repositories/trip.repository';
import {
  StartTripDto,
  BatchTelemetryDto,
  TriggerSosDto,
} from '../dto/trip.dto';
import { Trip, TripStatus } from '../entities/trip.entity';
import { SegmentService } from '../../risk-engine/services/segment.service';
import { TelemetryService } from './telemetry.service';
import { SOSRepository } from '../repositories/sos.repository';
import { EncryptionService } from './encryption.service';
import { EscalationService } from './escalation.service';

@Injectable()
export class TripService {
  constructor(
    private readonly tripRepository: TripRepository,
    private readonly segmentService: SegmentService,
    private readonly telemetryService: TelemetryService,
    private readonly sosRepository: SOSRepository,
    private readonly encryptionService: EncryptionService,
    private readonly escalationService: EscalationService,
  ) {}

  async startTrip(userIdHash: string, dto: StartTripDto): Promise<any> {
    // Check for existing active trips
    const activeTrips =
      await this.tripRepository.findActiveByUserId(userIdHash);
    if (activeTrips.length > 0) {
      throw new BadRequestException('User already has an active trip');
    }

    // 1. Compute expected route (Mocking polyline for now as requested in architecture)
    const expectedPolyline = `LINESTRING(${dto.startLng} ${dto.startLat}, ${dto.destLng} ${dto.destLat})`;

    // 2. Query Risk Engine for baseline risk
    const riskAnalysis = await this.segmentService.getRouteRisk(
      dto.city,
      expectedPolyline,
    );

    // 3. Save trip
    const trip = await this.tripRepository.create({
      user_id_hash: userIdHash,
      city: dto.city,
      start_location: {
        type: 'Point',
        coordinates: [dto.startLng, dto.startLat],
      },
      destination: dto.destLat
        ? { type: 'Point', coordinates: [dto.destLng, dto.destLat] }
        : null,
      expected_route: expectedPolyline,
      baseline_risk: riskAnalysis.overallRisk,
      current_risk: riskAnalysis.overallRisk,
      status: TripStatus.ACTIVE,
    });

    return {
      tripId: trip.id,
      expectedPolyline: expectedPolyline, // In real case, returned encoded polyline
      baselineRisk: trip.baseline_risk,
      status: trip.status,
    };
  }

  async processTelemetry(
    userIdHash: string,
    dto: BatchTelemetryDto,
  ): Promise<any> {
    const trip = await this.tripRepository.findById(dto.tripId);
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.user_id_hash !== userIdHash)
      throw new UnauthorizedException('Unauthorized');
    if (trip.status !== TripStatus.ACTIVE)
      throw new BadRequestException('Trip is not active');

    // Delegate to TelemetryService (which will handle storage and anomaly checks async)
    await this.telemetryService.handleBatch(trip, dto.points);

    return { ack: true };
  }

  async endTrip(userIdHash: string, tripId: string): Promise<any> {
    const trip = await this.tripRepository.findById(tripId);
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.user_id_hash !== userIdHash)
      throw new UnauthorizedException('Unauthorized');

    trip.status = TripStatus.COMPLETED;
    trip.ended_at = new Date();
    await this.tripRepository.save(trip);

    return { status: trip.status };
  }

  async triggerSos(userIdHash: string, dto: TriggerSosDto): Promise<any> {
    const trip = await this.tripRepository.findById(dto.tripId);
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.user_id_hash !== userIdHash)
      throw new UnauthorizedException('Unauthorized');

    // 1. Store encrypted payload
    const encryptedBuffer = Buffer.from(dto.encryptedPayload, 'base64');
    await this.sosRepository.create({
      trip_id: trip.id,
      user_id_hash: userIdHash,
      encrypted_payload: encryptedBuffer,
    });

    // 2. Update trip status
    trip.status = TripStatus.ESCALATED;
    await this.tripRepository.save(trip);

    // 3. Trigger escalation flow
    await this.escalationService.escalateSos(trip, dto.encryptedPayload);

    return { status: 'escalated' };
  }
}
