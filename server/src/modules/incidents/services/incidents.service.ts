import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Incident, VerifiedStatus } from '../entities/incident.entity';
import { CreateIncidentDto } from '../dto/create-incident.dto';

@Injectable()
export class IncidentsService {
    constructor(
        @InjectRepository(Incident)
        private readonly incidentRepository: Repository<Incident>,
    ) { }

    async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
        // 1. Anti-Spam: Rate limiting per reporter (max 3 per 24h)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const reportCount = await this.incidentRepository.count({
            where: {
                reporter_hash: createIncidentDto.reporter_hash,
                created_at: MoreThan(twentyFourHoursAgo),
            },
        });

        if (reportCount >= 3) {
            throw new BadRequestException('Reporting limit reached (max 3 per 24h).');
        }

        // 2. Grid Assignment (Simple rounding for MVP)
        // In a production app, we would use H3 or PostGIS grid functions
        const gridCellId = this.calculateGridCellId(createIncidentDto.location.lat, createIncidentDto.location.lng);

        // 3. Create Entity
        const incident = this.incidentRepository.create({
            ...createIncidentDto,
            grid_cell_id: gridCellId,
            location: {
                type: 'Point',
                coordinates: [createIncidentDto.location.lng, createIncidentDto.location.lat],
            },
        });

        const savedIncident = await this.incidentRepository.save(incident);

        // 4. Trigger Corroboration Check (Async)
        this.checkCorroboration(gridCellId, createIncidentDto.incident_type);

        return savedIncident;
    }

    private calculateGridCellId(lat: number, lng: number): string {
        // Resolution of ~1.1km at equator (0.01 decimal degrees)
        const res = 0.01;
        const latRef = Math.floor(lat / res) * res;
        const lngRef = Math.floor(lng / res) * res;
        return `${latRef.toFixed(2)},${lngRef.toFixed(2)}`;
    }

    private async checkCorroboration(gridCellId: string, incidentType: string): Promise<void> {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

        // Find unverified incidents in the same cell and type within 12h
        const incidents = await this.incidentRepository.find({
            where: {
                grid_cell_id: gridCellId,
                incident_type: incidentType,
                verified_status: VerifiedStatus.UNVERIFIED,
                created_at: MoreThan(twelveHoursAgo),
            },
        });

        if (incidents.length >= 3) {
            // Mark all as corroborated
            await this.incidentRepository.update(
                incidents.map(i => i.id),
                { verified_status: VerifiedStatus.CORROBORATED }
            );
            // TODO: Emit event 'incident.corroborated'
        }
    }
}
