import { Injectable, Inject } from '@nestjs/common';
import { HotspotRepository } from '../repositories/hotspot.repository';
import Redis from 'ioredis';

@Injectable()
export class TileService {
  private readonly redis: Redis;

  constructor(private readonly hotspotRepository: HotspotRepository) {
    // Basic Redis instantiation, ideally provided via module config using 'ioredis' directly
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  /**
   * Fetch grid cells inside bounding box, format response, and cache
   * Cache key: risk:{city}:{zoom}:{bboxHash}:{timebucket}
   */
  async getRiskTiles(
    city: string,
    minLng: number,
    minLat: number,
    maxLng: number,
    maxLat: number,
    zoom: number,
    timebucket: string,
  ): Promise<any> {
    const bboxHash = this.generateBboxHash(minLng, minLat, maxLng, maxLat);
    const cacheKey = `risk:${city}:${zoom}:${bboxHash}:${timebucket}`;

    // Attempt to return cached response
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const cells = await this.hotspotRepository.findInBoundingBox(
      city,
      minLng,
      minLat,
      maxLng,
      maxLat,
    );

    const tiles = cells.map((cell) => {
      // In a real postgis geometry array query, centroid coordinates are returned inside coordinates array
      // Using arbitrary logic assuming pg returns GeoJSON for centroid point
      let lat = 0;
      let lng = 0;
      if (cell.centroid && cell.centroid.coordinates) {
        lng = cell.centroid.coordinates[0];
        lat = cell.centroid.coordinates[1];
      }

      // Timebucket weighting logic would adjust the riskScore here based on `timebucket`
      // e.g. evening increases standard risk score
      const timeWeight = timebucket === 'evening' ? 1.2 : 1.0;
      const adjustedRisk = Math.min(cell.risk_score * timeWeight, 10);

      return {
        gridCellId: cell.grid_cell_id,
        centroid: { lat, lng },
        riskScore: Number(adjustedRisk.toFixed(1)), // Keep it one decimal place
        riskLevel: cell.risk_level,
        lastUpdated: cell.last_updated,
      };
    });

    const response = { tiles };

    // Redis caching for 2-5 minutes
    const ttlSeconds = 300; // 5 mins
    await this.redis.setex(cacheKey, ttlSeconds, JSON.stringify(response));

    return response;
  }

  private generateBboxHash(
    minLng: number,
    minLat: number,
    maxLng: number,
    maxLat: number,
  ): string {
    return `${minLng.toFixed(4)}_${minLat.toFixed(4)}_${maxLng.toFixed(4)}_${maxLat.toFixed(4)}`;
  }
}
