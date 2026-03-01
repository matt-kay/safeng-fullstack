import { Injectable } from '@nestjs/common';

@Injectable()
export class SpikeService {
  /**
   * Computes the recency spike based on the last 24 hours vs baseline.
   * spike = (last_24h - baseline_hour_avg) / (baseline + eps)
   */
  computeSpikeNorm(
    last24h: number,
    baselineHourAvg: number,
    eps: number = 1.0,
  ): number {
    // If we have a tiny baseline, the eps prevents dividing by zero.
    // If we have zero current 24h risk, spike is naturally zero or negative.
    const spikeRaw = (last24h - baselineHourAvg) / (baselineHourAvg + eps);

    // Clamp between 0 and 1, assuming negative spikes aren't treated as "negative" risk
    // A spike of 1 means 100%+ deviation usually, but we define clamp based on our needs.
    // For normalization we assume 1.0 represents the maximum concern spike.
    return this.clamp(spikeRaw, 0, 1);
  }

  private clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
  }
}
