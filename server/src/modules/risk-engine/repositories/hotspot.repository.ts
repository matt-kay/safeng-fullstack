import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotspotGrid } from '../entities/hotspot-grid.entity';

@Injectable()
export class HotspotRepository {
    constructor(
        @InjectRepository(HotspotGrid)
        private readonly repository: Repository<HotspotGrid>,
    ) { }

    /**
     * Find all grid cells within a bounding box
     * @param city The city to filter by
     * @param minLng Bounding box min longitude
     * @param minLat Bounding box min latitude
     * @param maxLng Bounding box max longitude
     * @param maxLat Bounding box max latitude
     * @returns Array of HotspotGrid entities with centroids
     */
    async findInBoundingBox(
        city: string,
        minLng: number,
        minLat: number,
        maxLng: number,
        maxLat: number,
    ): Promise<HotspotGrid[]> {
        // PostGIS intersection query using ST_MakeEnvelope
        return this.repository
            .createQueryBuilder('grid')
            .where('grid.city = :city', { city })
            .andWhere(
                'ST_Intersects(grid.centroid, ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326))',
                { minLng, minLat, maxLng, maxLat },
            )
            .getMany();
    }

    /**
     * Find a specific cell by its centroid (assuming we map exact coordinates to a cell, 
     * or we find the cell containing the point if it were polygons. 
     * Since they are points, we can find the nearest cell within a small radius.)
     */
    async findNearestCell(
        city: string,
        lng: number,
        lat: number,
        radiusMeters: number = 100,
    ): Promise<HotspotGrid | null> {
        return this.repository
            .createQueryBuilder('grid')
            .where('grid.city = :city', { city })
            .andWhere(
                'ST_DWithin(grid.centroid::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)',
                { lng, lat, radiusMeters },
            )
            .orderBy(
                'ST_Distance(grid.centroid::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)',
                'ASC',
            )
            .getOne();
    }
}
