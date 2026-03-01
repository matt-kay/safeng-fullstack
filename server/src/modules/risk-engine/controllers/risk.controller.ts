import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RiskService } from '../services/risk.service';
import { TileService } from '../services/tile.service';
import { SegmentService } from '../services/segment.service';
import {
  GetRiskTilesDto,
  GetRiskHereDto,
  GetRouteRiskDto,
  GetTopCorridorsDto,
} from '../dto/risk.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Risk Engine')
@Controller('risk')
export class RiskController {
  constructor(
    private readonly riskService: RiskService,
    private readonly tileService: TileService,
    private readonly segmentService: SegmentService,
  ) {}

  @Get('tiles')
  @ApiOperation({ summary: 'Get risk heatmap tiles for a bounding box' })
  async getTiles(@Query() query: GetRiskTilesDto) {
    const [minLng, minLat, maxLng, maxLat] = query.bbox.split(',').map(Number);
    return this.tileService.getRiskTiles(
      query.city,
      minLng,
      minLat,
      maxLng,
      maxLat,
      query.zoom,
      query.timebucket || 'default',
    );
  }

  @Get('here')
  @ApiOperation({
    summary: 'Get risk score and components for a specific location',
  })
  async getRiskHere(@Query() query: GetRiskHereDto) {
    return this.riskService.getSpecificPointRisk(
      query.city,
      query.lat,
      query.lng,
      query.time,
    );
  }

  @Get('route')
  @ApiOperation({ summary: 'Get risk analysis for a route polyline' })
  async getRouteRisk(@Query() query: GetRouteRiskDto) {
    return this.segmentService.getRouteRisk(
      query.city,
      query.polyline,
      query.time,
    );
  }

  @Get('corridors')
  @ApiOperation({ summary: 'Get top risk corridors for a city (Admin)' })
  async getTopCorridors(@Query() query: GetTopCorridorsDto) {
    // For MVP, this could return segments with highest risk_score
    // Implementation placeholder logic
    return {
      city: query.city,
      corridors: [],
    };
  }
}
