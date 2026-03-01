import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripTelemetry } from '../entities/telemetry.entity';

@Injectable()
export class TelemetryRepository {
  constructor(
    @InjectRepository(TripTelemetry)
    private readonly repository: Repository<TripTelemetry>,
  ) {}

  async createBatch(points: Partial<TripTelemetry>[]): Promise<void> {
    await this.repository.insert(points);
  }

  async getLatestForTrip(trip_id: string): Promise<TripTelemetry | null> {
    return this.repository.findOne({
      where: { trip_id },
      order: { recorded_at: 'DESC' },
    });
  }

  async getRecentHistory(
    trip_id: string,
    limit: number = 10,
  ): Promise<TripTelemetry[]> {
    return this.repository.find({
      where: { trip_id },
      order: { recorded_at: 'DESC' },
      take: limit,
    });
  }

  async getDistanceToExpectedRoute(
    trip_id: string,
    expectedRouteWkt: string,
  ): Promise<number> {
    const result = await this.repository.query(
      `
            SELECT ST_Distance(
                (SELECT location::geography FROM trip_telemetry WHERE trip_id = $1 ORDER BY recorded_at DESC LIMIT 1),
                ST_GeomFromText($2, 4326)::geography
            ) as distance
            `,
      [trip_id, expectedRouteWkt],
    );
    return result[0]?.distance || 0;
  }
}
