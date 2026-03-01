import { Injectable } from '@nestjs/common';
import { SegmentRepository } from '../repositories/segment.repository';

@Injectable()
export class SegmentService {
  constructor(private readonly segmentRepository: SegmentRepository) {}

  /**
   * Assess the risk of a given polyline
   */
  async getRouteRisk(
    city: string,
    polyline: string,
    timeString?: string,
  ): Promise<any> {
    // Decoding polyline into WKT: In reality you'd parse from google polyline format to WKT LINESTRING
    // For now we assume `polyline` holds a valid WKT LINESTRING or we'd convert it
    const wktLinestring = this.decodePolylineToWKT(polyline);

    // Extract hour of day
    const requestDate = timeString ? new Date(timeString) : new Date();
    const hourOfDay = requestDate.getUTCHours();

    const segments = await this.segmentRepository.findIntersectingSegments(
      city,
      wktLinestring,
      hourOfDay,
    );

    if (!segments || segments.length === 0) {
      return { overallRisk: 0, segments: [] };
    }

    // Mean risk calculation
    let totalRisk = 0;
    const mappedSegments = segments.map((s) => {
      totalRisk += s.risk_score;
      return {
        segmentId: s.segment_id,
        riskScore: s.risk_score,
      };
    });

    return {
      overallRisk: Number((totalRisk / segments.length).toFixed(1)),
      segments: mappedSegments,
    };
  }

  /**
   * Placeholder to decode Google Polyline string into a LINESTRING(x y, x y) PostGIS WKT string.
   */
  private decodePolylineToWKT(encodedPolyline: string): string {
    // Since implementing the entire polyline decoder is lengthy,
    // a real application typically uses the @mapbox/polyline package to get coords,
    // then construct the WKT formatting: `LINESTRING(${coords.map(c => c[1] + ' ' + c[0]).join(', ')})`
    // Returning dummy for structural placement
    return encodedPolyline;
  }
}
