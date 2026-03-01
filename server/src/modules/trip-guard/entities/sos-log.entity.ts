import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

export enum EscalationStatus {
  PENDING = 'pending',
  NOTIFIED = 'notified',
  RESOLVED = 'resolved',
  FAILED = 'failed',
}

@Entity('sos_logs')
export class SOSLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  trip_id: string;

  @Column({ type: 'varchar' })
  @Index()
  user_id_hash: string;

  @Column({ type: 'bytea' })
  encrypted_payload: Buffer;

  @CreateDateColumn()
  triggered_at: Date;

  @Column({
    type: 'enum',
    enum: EscalationStatus,
    default: EscalationStatus.PENDING,
  })
  escalation_status: EscalationStatus;
}
