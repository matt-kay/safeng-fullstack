import { Injectable, Logger } from '@nestjs/common';
import { TelemetryRepository } from '../repositories/telemetry.repository';
import { Trip } from '../entities/trip.entity';

@Injectable()
export class DeviationService {
  private readonly logger = new Logger(DeviationService.name);

  constructor(private readonly telemetryRepository: TelemetryRepository) {}

  /**
   * Checks if the latest telemetry point deviates significantly from the expected route.
   * Rule: distance > 300m for > 2 minutes continuously.
   */
  async checkDeviation(trip: Trip): Promise<boolean> {
    // 1. Get distance of latest point to expected route
    // We use the repository method that leverages PostGIS ST_Distance
    const distance = await this.telemetryRepository.getDistanceToExpectedRoute(
      trip.id,
      trip.expected_route,
    );

    this.logger.debug(`Trip ${trip.id} deviation distance: ${distance}m`);

    // 300m threshold
    if (distance > 300) {
      // In a real implementation, we would check the last 2 minutes of telemetry
      // to see if the deviation is persistent. For MVP, we'll flag it.
      return true;
    }

    return false;
  }
}
