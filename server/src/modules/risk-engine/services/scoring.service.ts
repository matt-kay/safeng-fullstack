import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoringService {
  /**
   * Calculate final grid risk score 0-10 based on normalized components
   * Formula: clamp(0.30*density_norm + 0.20*spike_norm + 0.10*time_of_day_weight + 0.10*reporter_confidence + 0.30*historical_weight)
   */
  calculateGridRisk(
    densityNorm: number, // 0-1
    spikeNorm: number, // 0-1
    timeOfDayWeight: number, // 0-1
    reporterConfidence: number, // 0-1
    historicalWeight: number, // 0-1
  ): number {
    const rawScore =
      0.3 * densityNorm +
      0.2 * spikeNorm +
      0.1 * timeOfDayWeight +
      0.1 * reporterConfidence +
      0.3 * historicalWeight;

    // Scale to 0-10
    const scaledScore = rawScore * 10;
    return this.clamp(scaledScore, 0, 10);
  }

  /**
   * Compute Risk Score dynamically with slightly different formula from spec for full components
   */
  calculateDetailedRisk(
    density: number,
    spike: number,
    vehicleSimilarity: number = 0,
    routeDeviationProbability: number = 0,
    timeOfDay: number = 0,
    reporterConfidence: number = 0,
  ): number {
    const rawScore =
      0.3 * density +
      0.2 * spike +
      0.15 * vehicleSimilarity +
      0.15 * routeDeviationProbability +
      0.1 * timeOfDay +
      0.1 * reporterConfidence;

    return this.clamp(rawScore * 10, 0, 10);
  }

  private clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
  }
}
