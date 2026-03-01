import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from '../entities/trip.entity';

@Injectable()
export class TripRepository {
  constructor(
    @InjectRepository(Trip)
    private readonly repository: Repository<Trip>,
  ) {}

  async create(tripData: Partial<Trip>): Promise<Trip> {
    const trip = this.repository.create(tripData);
    return this.repository.save(trip);
  }

  async findById(id: string): Promise<Trip | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findActiveByUserId(user_id_hash: string): Promise<Trip[]> {
    return this.repository.find({
      where: { user_id_hash, status: TripStatus.ACTIVE },
    });
  }

  async update(id: string, updateData: Partial<Trip>): Promise<void> {
    await this.repository.update(id, updateData);
  }

  async save(trip: Trip): Promise<Trip> {
    return this.repository.save(trip);
  }
}
