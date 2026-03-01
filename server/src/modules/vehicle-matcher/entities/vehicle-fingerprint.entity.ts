import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TransportType {
    TAXI = 'taxi',
    BUS = 'bus',
    KEKE = 'keke',
    RIDE_HAILING = 'ride_hailing',
}

@Entity('vehicle_fingerprints')
@Index(['city', 'plate_hash'])
@Index(['city', 'plate_partial_hash'])
@Index(['city', 'simhash'])
export class VehicleFingerprint {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    city: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    plate_hash: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    plate_partial_hash: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    vehicle_make: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    vehicle_color: string;

    @Column({ type: 'enum', enum: TransportType, default: TransportType.TAXI })
    transport_type: TransportType;

    @Column({ type: 'boolean', default: false })
    tinted_windows: boolean;

    @Column({ type: 'text', array: true, default: [] })
    distinctive_tokens: string[];

    @Column({
        type: 'bigint', transformer: {
            to: (value: bigint) => value?.toString(),
            from: (value: string) => value ? BigInt(value) : null
        }, nullable: true
    })
    simhash: bigint;

    @Column({ type: 'int', default: 1 })
    sightings_count: number;

    @CreateDateColumn()
    first_seen: Date;

    @UpdateDateColumn()
    last_seen: Date;
}
