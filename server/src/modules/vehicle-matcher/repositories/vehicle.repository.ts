import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { VehicleFingerprint } from '../entities/vehicle-fingerprint.entity';

@Injectable()
export class VehicleRepository extends Repository<VehicleFingerprint> {
    constructor(private dataSource: DataSource) {
        super(VehicleFingerprint, dataSource.createEntityManager());
    }

    async findByPlateHash(city: string, plateHash: string): Promise<VehicleFingerprint | null> {
        return this.findOne({ where: { city, plate_hash: plateHash } });
    }

    async findByPartialHash(city: string, partialHash: string): Promise<VehicleFingerprint | null> {
        return this.findOne({ where: { city, plate_partial_hash: partialHash } });
    }

    async findSimilarBySimHash(city: string, simHash: bigint, maxDistance: number): Promise<{ vehicle: VehicleFingerprint, distance: number }[]> {
        // This requires a custom SQL query for Hamming distance if not using a specialized plugin
        // In Postgres, we can use `BIT_COUNT(simhash # $1)`
        // Note: This assumes simhash is stored in a way that allows bitwise operations (e.g. bigint)
        const result = await this.query(
            `SELECT *, 
       (length(replace((simhash::bigint # $1::bigint)::bit(64)::text, '0', ''))) as distance 
       FROM vehicle_fingerprints 
       WHERE city = $2 
       AND (length(replace((simhash::bigint # $1::bigint)::bit(64)::text, '0', ''))) <= $3
       ORDER BY distance ASC`,
            [simHash.toString(), city, maxDistance]
        );

        return result.map(r => ({
            vehicle: this.create(r),
            distance: parseInt(r.distance, 10)
        }));
    }
}
