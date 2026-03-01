import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsModule } from '../incidents/incidents.module';
import { RiskEngineModule } from '../risk-engine/risk-engine.module';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';

@Module({
    imports: [
        IncidentsModule,
        RiskEngineModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
