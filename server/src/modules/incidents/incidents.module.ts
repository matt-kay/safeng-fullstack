import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './entities/incident.entity';
import { IncidentsService } from './services/incidents.service';
import { IncidentsController } from './controllers/incidents.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Incident]),
    ],
    controllers: [IncidentsController],
    providers: [IncidentsService],
    exports: [IncidentsService, TypeOrmModule],
})
export class IncidentsModule { }

