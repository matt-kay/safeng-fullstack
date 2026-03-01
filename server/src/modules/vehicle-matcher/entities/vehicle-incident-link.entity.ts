import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VehicleFingerprint } from './vehicle-fingerprint.entity';
import { Incident } from '../../incidents/entities/incident.entity';

@Entity('vehicle_incident_links')
export class VehicleIncidentLink {
    @PrimaryColumn({ type: 'uuid' })
    vehicle_id: string;

    @PrimaryColumn({ type: 'uuid' })
    incident_id: string;

    @Column({ type: 'float', default: 0 })
    severity_weight: number;

    @CreateDateColumn()
    linked_at: Date;

    @ManyToOne(() => VehicleFingerprint)
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: VehicleFingerprint;

    @ManyToOne(() => Incident)
    @JoinColumn({ name: 'incident_id' })
    incident: Incident;
}
