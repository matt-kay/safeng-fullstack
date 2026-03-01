import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TripStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ESCALATED = 'escalated',
}

@Entity('trips')
@Index(['user_id_hash', 'status'])
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id_hash: string;

  @Column({ type: 'varchar' })
  @Index()
  city: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  start_location: any;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  destination: any;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'LineString',
    srid: 4326,
  })
  @Index({ spatial: true })
  expected_route: any;

  @CreateDateColumn()
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ended_at: Date;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.ACTIVE })
  status: TripStatus;

  @Column({ type: 'float', default: 0 })
  baseline_risk: number;

  @Column({ type: 'float', default: 0 })
  current_risk: number;

  @Column({ type: 'boolean', default: false })
  deviation_flag: boolean;

  @Column({ type: 'boolean', default: false })
  isolation_flag: boolean;

  @Column({ type: 'boolean', default: false })
  signal_loss_flag: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}
