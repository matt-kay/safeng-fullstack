import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleFingerprint } from './entities/vehicle-fingerprint.entity';
import { VehicleIncidentLink } from './entities/vehicle-incident-link.entity';
import { VehicleController } from './controllers/vehicle.controller';
import { VehicleService } from './services/vehicle.service';
import { FingerprintService } from './services/fingerprint.service';
import { SimilarityService } from './services/similarity.service';
import { TrustScoreService } from './services/trust-score.service';
import { VehicleRepository } from './repositories/vehicle.repository';
import { IncidentLinkRepository } from './repositories/incident-link.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([VehicleFingerprint, VehicleIncidentLink]),
    ],
    controllers: [VehicleController],
    providers: [
        VehicleService,
        FingerprintService,
        SimilarityService,
        TrustScoreService,
        VehicleRepository,
        IncidentLinkRepository,
    ],
    exports: [VehicleService],
})
export class VehicleMatcherModule { }
