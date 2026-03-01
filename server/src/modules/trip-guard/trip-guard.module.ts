import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Trip } from './entities/trip.entity';
import { TripTelemetry } from './entities/telemetry.entity';
import { SOSLog } from './entities/sos-log.entity';
import { TripController } from './controllers/trip.controller';
import { SosController } from './controllers/sos.controller';
import { TripService } from './services/trip.service';
import { TelemetryService } from './services/telemetry.service';
import { DeviationService } from './services/deviation.service';
import { AnomalyService } from './services/anomaly.service';
import { EscalationService } from './services/escalation.service';
import { EncryptionService } from './services/encryption.service';
import { TripRepository } from './repositories/trip.repository';
import { TelemetryRepository } from './repositories/telemetry.repository';
import { SOSRepository } from './repositories/sos.repository';
import { MonitoringProcessor } from './jobs/monitoring.processor';
import { RiskEngineModule } from '../risk-engine/risk-engine.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, TripTelemetry, SOSLog]),
    BullModule.registerQueue({ name: 'trip-monitoring' }),
    RiskEngineModule,
  ],
  controllers: [TripController, SosController],
  providers: [
    TripService,
    TelemetryService,
    DeviationService,
    AnomalyService,
    EscalationService,
    EncryptionService,
    TripRepository,
    TelemetryRepository,
    SOSRepository,
    MonitoringProcessor,
  ],
  exports: [TripService],
})
export class TripGuardModule {}
