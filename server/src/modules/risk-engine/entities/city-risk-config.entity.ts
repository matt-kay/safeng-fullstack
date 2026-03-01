import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('city_risk_config')
export class CityRiskConfig {
    @PrimaryColumn({ type: 'varchar', length: 100 })
    city: string;

    @Column({ type: 'float', default: 0.15 })
    deviation_threshold: number;

    @Column({ type: 'float', default: 0.2 })
    spike_weight: number;

    @Column({ type: 'float', default: 0.1 })
    time_weight: number;
}
