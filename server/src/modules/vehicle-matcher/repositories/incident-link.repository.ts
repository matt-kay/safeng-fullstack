import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { VehicleIncidentLink } from '../entities/vehicle-incident-link.entity';

@Injectable()
export class IncidentLinkRepository extends Repository<VehicleIncidentLink> {
    constructor(private dataSource: DataSource) {
        super(VehicleIncidentLink, dataSource.createEntityManager());
    }

    async findByVehicleId(vehicleId: string): Promise<any[]> {
        return this.find({
            where: { vehicle_id: vehicleId },
            relations: ['incident'],
        });
    }
}
