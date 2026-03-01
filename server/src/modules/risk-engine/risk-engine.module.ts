import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { HotspotGrid } from './entities/hotspot-grid.entity';
import { RouteSegmentRisk } from './entities/route-segment-risk.entity';
import { CityRiskConfig } from './entities/city-risk-config.entity';
import { RiskController } from './controllers/risk.controller';
import { RiskService } from './services/risk.service';
import { TileService } from './services/tile.service';
import { ScoringService } from './services/scoring.service';
import { SpikeService } from './services/spike.service';
import { SegmentService } from './services/segment.service';
import { HotspotRepository } from './repositories/hotspot.repository';
import { SegmentRepository } from './repositories/segment.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([HotspotGrid, RouteSegmentRisk, CityRiskConfig]),
        BullModule.registerQueue({ name: 'risk-rollup' }),
    ],
    controllers: [RiskController],
    providers: [
        RiskService,
        TileService,
        ScoringService,
        SpikeService,
        SegmentService,
        HotspotRepository,
        SegmentRepository,
    ],
    exports: [RiskService, TileService, SegmentService],
})
export class RiskEngineModule { }
