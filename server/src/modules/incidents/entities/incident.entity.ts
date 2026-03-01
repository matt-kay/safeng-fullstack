import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum IncidentSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export enum TransportType {
    TAXI = 'taxi',
    BUS = 'bus',
    KEKE = 'keke',
    RIDE_HAILING = 'ride_hailing',
    PRIVATE = 'private',
}

export enum Outcome {
    ESCAPED = 'escaped',
    HARMED = 'harmed',
    LOSS_OF_PROPERTY = 'loss_of_property',
    OTHER = 'other',
}

export enum VerifiedStatus {
    UNVERIFIED = 'unverified',
    CORROBORATED = 'corroborated',
    VERIFIED = 'verified',
}

@Entity('incident_reports')
export class Incident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    @Index()
    city: string;

    @Column({ type: 'varchar', length: 100 })
    incident_type: string;

    @Column({ type: 'enum', enum: IncidentSeverity, default: IncidentSeverity.LOW })
    severity: IncidentSeverity;

    @Column({ type: 'enum', enum: TransportType, default: TransportType.PRIVATE })
    transport_type: TransportType;

    @Column({ type: 'varchar', length: 50, nullable: true })
    vehicle_color: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    plate_partial: string;

    @Column({ type: 'enum', enum: Outcome, default: Outcome.OTHER })
    outcome: Outcome;

    @Column({ type: 'jsonb', nullable: true })
    threat_indicators: any;

    @Column({ type: 'varchar', length: 64 })
    @Index()
    reporter_hash: string;

    @Column({ type: 'enum', enum: VerifiedStatus, default: VerifiedStatus.UNVERIFIED })
    @Index()
    verified_status: VerifiedStatus;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    @Index({ spatial: true })
    location: any;

    @Column({ type: 'varchar', length: 20 })
    @Index()
    grid_cell_id: string;

    @CreateDateColumn()
    created_at: Date;
}

