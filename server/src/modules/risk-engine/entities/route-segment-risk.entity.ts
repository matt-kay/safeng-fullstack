import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('route_segment_risk')
export class RouteSegmentRisk {
  @PrimaryColumn()
  segment_id: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  geom: any;

  @Column({ type: 'int' })
  hour_of_day: number;

  @Column({ type: 'int' })
  day_of_week: number;

  @Column({ type: 'float', default: 0 })
  incident_density: number;

  @Column({ type: 'float', default: 0 })
  recency_spike: number;

  @Column({ type: 'float', default: 0 })
  risk_score: number;

  @Column({ type: 'float', default: 0 })
  trend_delta: number;
}
