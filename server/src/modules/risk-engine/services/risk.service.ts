import { Injectable } from '@nestjs/common';
import { HotspotRepository } from '../repositories/hotspot.repository';
import { ScoringService } from './scoring.service';
import { SpikeService } from './spike.service';

@Injectable()
export class RiskService {
  constructor(
    private readonly hotspotRepository: HotspotRepository,
    private readonly scoringService: ScoringService,
    private readonly spikeService: SpikeService,
  ) {}

  /**
   * Retrieves specific point risk components and scores for `/risk/here` endpoint
   */
  async getSpecificPointRisk(
    city: string,
    lat: number,
    lng: number,
    timeString?: string,
  ): Promise<any> {
    // Find nearest cached cell
    const cell = await this.hotspotRepository.findNearestCell(
      city,
      lng,
      lat,
      200,
    );

    if (!cell) {
      // In a real application, if no cell is found, we might compute on the fly,
      // fallback to city average, or return low risk.
      return {
        riskScore: 0,
        riskLevel: 'low',
        components: {
          density: 0,
          spike: 0,
          timeOfDay: 0,
          reporterConfidence: 0,
        },
      };
    }

    // Determine the spike dynamically based on time differences if needed, or pull from grid data
    // Assuming 'spike_norm' is managed by spike job, but let's calculate fresh if we wanted to
    const computedSpike = this.spikeService.computeSpikeNorm(
      cell.last_24h,
      cell.baseline_hour_avg,
    );

    // Apply time of day weight simply
    const requestDate = timeString ? new Date(timeString) : new Date();
    const hourOfDay = requestDate.getUTCHours();
    // Assuming nighttime (e.g. 20 - 4 UTC) has a 1.2 weight, normally we fetch config
    const timeOfDayWeight = hourOfDay >= 20 || hourOfDay <= 4 ? 1.2 : 1.0;

    // Density could be normalized prior, here we assume risk_score mapped it,
    // For this demonstration, we'll map components using the static method in ScoreService.
    const densityNorm = 0.5; // Mocks mapped percentile from DB
    const reporterConfidence = 0.8; // Mocks mapped reporter reputation

    const finalScore = this.scoringService.calculateGridRisk(
      densityNorm,
      computedSpike,
      timeOfDayWeight,
      reporterConfidence,
      0.3, // historical norm
    );

    let riskLevel = 'low';
    if (finalScore >= 7) riskLevel = 'high';
    else if (finalScore >= 4) riskLevel = 'medium';

    return {
      riskScore: Number(finalScore.toFixed(1)),
      riskLevel: riskLevel,
      components: {
        density: densityNorm,
        spike: Number(computedSpike.toFixed(2)),
        timeOfDay: timeOfDayWeight,
        reporterConfidence: reporterConfidence,
      },
    };
  }
}
