import { Injectable, Logger } from '@nestjs/common';
import { TelemetryRepository } from '../repositories/telemetry.repository';
import { Trip } from '../entities/trip.entity';
import { RiskService } from '../../risk-engine/services/risk.service';

@Injectable()
export class AnomalyService {
  private readonly logger = new Logger(AnomalyService.name);

  constructor(
    private readonly telemetryRepository: TelemetryRepository,
    private readonly riskService: RiskService,
  ) {}

  /**
   * Checks for isolation stops.
   * Conditions: speed < 1 m/s, duration > 3-5 mins, AND high grid risk.
   */
  async checkIsolation(trip: Trip): Promise<boolean> {
    const latestTelemetry = await this.telemetryRepository.getLatestForTrip(
      trip.id,
    );
    if (!latestTelemetry) return false;

    // 1. Check speed
    if (latestTelemetry.speed_mps >= 1) return false;

    // 2. Check risk at current location
    // Point geometry coordinates are [lng, lat]
    const [lng, lat] = latestTelemetry.location.coordinates;
    const risk = await this.riskService.getSpecificPointRisk(
      trip.city,
      lat,
      lng,
    );

    if (risk.riskLevel === 'high') {
      // In a real implementation, check duration of low speed
      this.logger.warn(
        `Isolation detected for trip ${trip.id} in high-risk area`,
      );
      return true;
    }

    return false;
  }

  /**
   * Checks for signal loss.
   * Rule: No telemetry received for > X minutes or networkState = offline for > Y minutes.
   */
  async checkSignalLoss(trip: Trip): Promise<boolean> {
    const latestTelemetry = await this.telemetryRepository.getLatestForTrip(
      trip.id,
    );
    if (!latestTelemetry) return true; // No telemetry at all could be signal loss

    const lastSeen = latestTelemetry.recorded_at.getTime();
    const now = Date.now();
    const diffMinutes = (now - lastSeen) / (1000 * 60);

    // Threshold 5 minutes
    if (diffMinutes > 5) return true;

    if (latestTelemetry.network_state === 'offline' && diffMinutes > 2)
      return true;

    return false;
  }
}
