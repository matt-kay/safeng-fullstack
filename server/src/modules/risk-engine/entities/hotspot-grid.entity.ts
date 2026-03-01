import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('hotspot_grid')
@Index(['city', 'grid_cell_id'], { unique: true })
@Index(['city', 'risk_score']) // Index for generic top risk querying
export class HotspotGrid {
  @PrimaryColumn()
  grid_cell_id: string; // H3 or stable grid ID

  @Column({ type: 'varchar', length: 100 })
  city: string;

  // PostGIS point geometry
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  centroid: any; // Using `any` or a specific GeoJSON Type if desired, handled natively by TypeORM + pg

  @Column({ type: 'int', default: 0 })
  rolling_7d: number;

  @Column({ type: 'int', default: 0 })
  rolling_30d: number;

  @Column({ type: 'int', default: 0 })
  rolling_90d: number;

  @Column({ type: 'int', default: 0 })
  last_24h: number;

  @Column({ type: 'float', default: 0 })
  baseline_hour_avg: number;

  @Column({ type: 'float', default: 1.0 })
  time_of_day_weight: number;

  @Column({ type: 'float', default: 0 })
  risk_score: number; // 0-10

  @Column({ type: 'enum', enum: RiskLevel, default: RiskLevel.LOW })
  risk_level: RiskLevel;

  @UpdateDateColumn()
  last_updated: Date;
}
