import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum IncidentSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity('incidents')
export class Incident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    city: string;

    @Column({ type: 'varchar', length: 100 })
    incident_type: string;

    @Column({ type: 'enum', enum: IncidentSeverity, default: IncidentSeverity.LOW })
    severity: IncidentSeverity;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    location: any;

    @Column({ type: 'varchar', length: 15, nullable: true })
    grid_cell_id: string;

    @CreateDateColumn()
    created_at: Date;
}
