import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SOSLog } from '../entities/sos-log.entity';

@Injectable()
export class SOSRepository {
  constructor(
    @InjectRepository(SOSLog)
    private readonly repository: Repository<SOSLog>,
  ) {}

  async create(sosData: Partial<SOSLog>): Promise<SOSLog> {
    const log = this.repository.create(sosData);
    return this.repository.save(log);
  }

  async findById(id: string): Promise<SOSLog | null> {
    return this.repository.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: any): Promise<void> {
    await this.repository.update(id, { escalation_status: status });
  }
}
