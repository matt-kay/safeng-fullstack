import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TripRepository } from '../repositories/trip.repository';
import { DeviationService } from '../services/deviation.service';
import { AnomalyService } from '../services/anomaly.service';
import { EscalationService } from '../services/escalation.service';
import { TripStatus } from '../entities/trip.entity';

@Processor('trip-monitoring')
export class MonitoringProcessor extends WorkerHost {
  private readonly logger = new Logger(MonitoringProcessor.name);

  constructor(
    private readonly tripRepository: TripRepository,
    private readonly deviationService: DeviationService,
    private readonly anomalyService: AnomalyService,
    private readonly escalationService: EscalationService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { tripId } = job.data;
    const trip = await this.tripRepository.findById(tripId);

    if (!trip || trip.status !== TripStatus.ACTIVE) {
      return;
    }

    switch (job.name) {
      case 'telemetry.process':
        await this.handleTelemetryAnalysis(trip);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleTelemetryAnalysis(trip: any) {
    // 1. Run detection checks
    const deviation = await this.deviationService.checkDeviation(trip);
    const isolation = await this.anomalyService.checkIsolation(trip);
    const signalLoss = await this.anomalyService.checkSignalLoss(trip);

    // 2. Update flags
    trip.deviation_flag = deviation;
    trip.isolation_flag = isolation;
    trip.signal_loss_flag = signalLoss;

    // 3. Calculate dynamic risk (Placeholder for 5.4 Trip Risk Calculation)
    let riskDelta = 0;
    if (deviation) riskDelta += 2.5;
    if (isolation) riskDelta += 2.0;
    if (signalLoss) riskDelta += 1.0;

    trip.current_risk = Math.min(10, trip.baseline_risk + riskDelta);

    // 4. Determine escalation
    const flagCount = [deviation, isolation, signalLoss].filter(
      (f) => f,
    ).length;
    if (flagCount >= 2) {
      trip.status = TripStatus.ESCALATED;
      await this.escalationService.escalateFlags(trip);
    }

    await this.tripRepository.save(trip);

    this.logger.debug(
      `Processed telemetry for trip ${trip.id}. Current Risk: ${trip.current_risk}`,
    );
  }
}
