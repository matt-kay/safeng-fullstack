import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteSegmentRisk } from '../entities/route-segment-risk.entity';

@Injectable()
export class SegmentRepository {
    constructor(
        @InjectRepository(RouteSegmentRisk)
        private readonly repository: Repository<RouteSegmentRisk>,
    ) { }

    /**
     * Get route risk segments intersecting a polyline
     * @param city City to filter limits
     * @param routeLineString WKT representation of the LineString (e.g. 'LINESTRING(lng lat, lng lat)')
     * @param hourOfDay The hour of the day (0-23)
     */
    async findIntersectingSegments(
        city: string,
        routeLineString: string,
        hourOfDay: number,
    ): Promise<RouteSegmentRisk[]> {
        return this.repository
            .createQueryBuilder('segment')
            .where('segment.city = :city', { city })
            .andWhere('segment.hour_of_day = :hourOfDay', { hourOfDay })
            .andWhere(
                'ST_Intersects(segment.geom, ST_GeomFromText(:routeLineString, 4326))',
                { routeLineString },
            )
            .getMany();
    }
}
