import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

export enum NetworkState {
  ONLINE = 'online',
  OFFLINE = 'offline',
  LIMITED = 'limited',
}

@Entity('trip_telemetry')
export class TripTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  trip_id: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: any;

  @Column({ type: 'float' })
  speed_mps: number;

  @Column({ type: 'float' })
  heading: number;

  @Column({ type: 'enum', enum: NetworkState, default: NetworkState.ONLINE })
  network_state: NetworkState;

  @CreateDateColumn()
  recorded_at: Date;
}
