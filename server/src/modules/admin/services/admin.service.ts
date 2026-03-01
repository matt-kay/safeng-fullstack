import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Incident, VerifiedStatus } from '../../incidents/entities/incident.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Incident)
        private readonly incidentRepository: Repository<Incident>,
    ) { }

    async getOverview() {
        const totalIncidents = await this.incidentRepository.count();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentIncidents = await this.incidentRepository.count({
            where: { created_at: MoreThan(sevenDaysAgo) },
        });

        // Simplified high risk cells for MVP
        const highRiskCells = await this.incidentRepository
            .createQueryBuilder('incident')
            .select('incident.grid_cell_id', 'grid_cell_id')
            .addSelect('COUNT(*)', 'count')
            .groupBy('incident.grid_cell_id')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();

        return {
            totalIncidents,
            recentIncidents,
            trends: {
                sevenDays: recentIncidents,
            },
            highRiskCells,
        };
    }

    async getIncidents(status?: VerifiedStatus, limit: number = 50, offset: number = 0) {
        return this.incidentRepository.find({
            where: status ? { verified_status: status } : {},
            order: { created_at: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async verifyIncident(id: string): Promise<Incident> {
        const incident = await this.incidentRepository.findOne({ where: { id } });
        if (!incident) throw new Error('Incident not found');

        incident.verified_status = VerifiedStatus.VERIFIED;
        return this.incidentRepository.save(incident);
    }
}
