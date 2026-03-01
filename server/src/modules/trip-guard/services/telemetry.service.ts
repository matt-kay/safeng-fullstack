import { Injectable, Logger } from '@nestjs/common';
import { TelemetryRepository } from '../repositories/telemetry.repository';
import { TelemetryPointDto } from '../dto/trip.dto';
import { Trip } from '../entities/trip.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    private readonly telemetryRepository: TelemetryRepository,
    @InjectQueue('trip-monitoring') private readonly monitoringQueue: Queue,
  ) {}

  async handleBatch(trip: Trip, points: TelemetryPointDto[]): Promise<void> {
    // 1. Map DTOs to Entity partials
    const entities = points.map((p) => ({
      trip_id: trip.id,
      location: { type: 'Point', coordinates: [p.lng, p.lat] },
      speed_mps: p.speed,
      heading: p.heading,
      network_state: p.networkState as any,
      recorded_at: new Date(p.timestamp),
    }));

    // 2. Save to database (Bulk insert)
    await this.telemetryRepository.createBatch(entities);

    // 3. Queue background job for anomaly detection
    // We pass the tripId and potentially the last processed telemetry ID or batch size
    await this.monitoringQueue.add(
      'telemetry.process',
      {
        tripId: trip.id,
        city: trip.city,
        batchSize: points.length,
      },
      {
        removeOnComplete: true,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );

    this.logger.debug(`Queued telemetry processing for trip ${trip.id}`);
  }
}
