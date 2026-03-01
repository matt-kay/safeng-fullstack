import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotspotGrid } from '../entities/hotspot-grid.entity';
import { ScoringService } from '../services/scoring.service';
import { SpikeService } from '../services/spike.service';
import { Logger } from '@nestjs/common';

@Processor('risk-rollup')
export class RollupProcessor extends WorkerHost {
  private readonly logger = new Logger(RollupProcessor.name);

  constructor(
    @InjectRepository(HotspotGrid)
    private readonly hotspotRepository: Repository<HotspotGrid>,
    private readonly scoringService: ScoringService,
    private readonly spikeService: SpikeService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'hourly-rollup':
        return this.handleHourlyRollup();
      case 'spike-update':
        return this.handleSpikeUpdate();
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleHourlyRollup() {
    this.logger.log('Starting hourly rollup for all hotspot grid cells');
    const cells = await this.hotspotRepository.find();

    for (const cell of cells) {
      // In a real scenario, this would involve complex SQL to aggregate incidents
      // into the rolling_7d, 30d, etc. fields instead of just re-saving.

      const spikeNorm = this.spikeService.computeSpikeNorm(
        cell.last_24h,
        cell.baseline_hour_avg,
      );

      // Mocked components for scoring
      const densityNorm = 0.5;
      const reporterConfidence = 0.8;
      const historicalWeight = 0.3;

      cell.risk_score = this.scoringService.calculateGridRisk(
        densityNorm,
        spikeNorm,
        cell.time_of_day_weight,
        reporterConfidence,
        historicalWeight,
      );

      // Update level
      if (cell.risk_score >= 7)
        cell.risk_level = (cell as any).constructor.RiskLevel?.HIGH || 'high';
      else if (cell.risk_score >= 4)
        cell.risk_level =
          (cell as any).constructor.RiskLevel?.MEDIUM || 'medium';
      else cell.risk_level = (cell as any).constructor.RiskLevel?.LOW || 'low';

      await this.hotspotRepository.save(cell);
    }

    this.logger.log(`Hourly rollup completed for ${cells.length} cells`);
  }

  private async handleSpikeUpdate() {
    this.logger.log('Starting spike-only update');
    // Implementation would be similar but only focusing on spike_norm and final score
  }
}
