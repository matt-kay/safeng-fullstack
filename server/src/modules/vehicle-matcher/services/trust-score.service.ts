import { Injectable } from '@nestjs/common';
import { IncidentSeverity } from '../../incidents/entities/incident.entity';
import { VehicleIncidentLink } from '../entities/vehicle-incident-link.entity';

@Injectable()
export class TrustScoreService {
    calculateScore(links: (VehicleIncidentLink & { incident?: { severity: IncidentSeverity, created_at: Date } })[], matchConfidence: number): { score: number, incidentCount: number } {
        let score = 100;
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        for (const link of links) {
            if (!link.incident) continue;

            let penalty = 0;
            switch (link.incident.severity) {
                case IncidentSeverity.HIGH:
                    penalty = 15;
                    break;
                case IncidentSeverity.MEDIUM:
                    penalty = 8;
                    break;
                case IncidentSeverity.LOW:
                    penalty = 4;
                    break;
            }

            // Recency multiplier
            if (link.incident.created_at > sevenDaysAgo) {
                penalty *= 1.1;
            }

            score -= penalty;
        }

        // Adjust score based on match confidence
        // If confidence is low, we don't penalize as heavily, but we also don't trust the 100 base score as much
        // Actually, the spec says: score *= confidence
        score = Math.max(0, score) * matchConfidence;

        return {
            score: Math.round(Math.min(100, Math.max(0, score))),
            incidentCount: links.length,
        };
    }
}
