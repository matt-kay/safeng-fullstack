import { Injectable } from '@nestjs/common';
import { RiskService } from '../../risk-engine/services/risk.service';

export interface PickupRecommendation {
    lat: number;
    lng: number;
    label: string;
    walk_distance_m: number;
    risk_score: number;
    reason: string;
}

@Injectable()
export class PickupService {
    constructor(
        private readonly riskService: RiskService,
    ) { }

    async recommend(city: string, lat: number, lng: number, radiusM: number): Promise<PickupRecommendation[]> {
        // 1. Generate candidate points within radius (e.g., 5 points in a circle/cross pattern)
        const candidates = this.generateCandidates(lat, lng, radiusM);

        const recommendations: PickupRecommendation[] = [];

        for (const candidate of candidates) {
            const riskData = await this.riskService.getSpecificPointRisk(
                city,
                candidate.lat,
                candidate.lng,
            );

            recommendations.push({
                ...candidate,
                risk_score: riskData.riskScore,
                reason: this.generateReason(riskData),
            });
        }

        // Sort by risk_score (lowest first)
        return recommendations.sort((a, b) => a.risk_score - b.risk_score).slice(0, 3);
    }

    private generateCandidates(lat: number, lng: number, radiusM: number) {
        // Simple candidate generation: current point + 4 points at cardinal directions
        // Convert radiusM to decimal degrees (approx)
        const d = radiusM / 111320;

        return [
            { lat, lng, label: 'Current Location', walk_distance_m: 0 },
            { lat: lat + d, lng, label: 'North Points', walk_distance_m: radiusM },
            { lat: lat - d, lng, label: 'South Points', walk_distance_m: radiusM },
            { lat, lng: lng + d, label: 'East Points', walk_distance_m: radiusM },
            { lat, lng: lng - d, label: 'West Points', walk_distance_m: radiusM },
        ];
    }

    private generateReason(riskData: any): string {
        if (riskData.riskScore < 3) return 'Low historical incident density';
        if (riskData.components.spike === 0) return 'Stable safety trend';
        if (riskData.components.timeOfDay < 1) return 'High daytime visibility';
        return 'Standard pickup area';
    }
}
