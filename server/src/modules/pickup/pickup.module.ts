import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskEngineModule } from '../risk-engine/risk-engine.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { PickupService } from './services/pickup.service';
import { PickupController } from './controllers/pickup.controller';

@Module({
    imports: [
        RiskEngineModule,
        IncidentsModule,
    ],
    controllers: [PickupController],
    providers: [PickupService],
    exports: [PickupService],
})
export class PickupModule { }
