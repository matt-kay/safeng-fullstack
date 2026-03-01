import { Test, TestingModule } from '@nestjs/testing';
import { TrustScoreService } from './trust-score.service';
import { IncidentSeverity } from '../../incidents/entities/incident.entity';

describe('TrustScoreService', () => {
    let service: TrustScoreService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TrustScoreService],
        }).compile();

        service = module.get<TrustScoreService>(TrustScoreService);
    });

    it('should calculate trust score correctly with incidents', () => {
        const now = new Date();
        const links = [
            {
                vehicle_id: 'v1',
                incident_id: 'i1',
                severity_weight: 1.0,
                linked_at: now,
                incident: {
                    severity: IncidentSeverity.HIGH,
                    created_at: now,
                },
            },
        ];

        // Base 100 - (15 * 1.1) = 83.5 => rounded
        // matchConfidence 1.0 => 84
        const result = service.calculateScore(links as any, 1.0);
        expect(result.score).toBe(84);
        expect(result.incidentCount).toBe(1);
    });

    it('should reduce score based on confidence', () => {
        const links = [];
        // Base 100 * 0.5 confidence = 50
        const result = service.calculateScore(links as any, 0.5);
        expect(result.score).toBe(50);
    });

    it('should clamp score between 0 and 100', () => {
        const links = Array(10).fill({
            incident: {
                severity: IncidentSeverity.HIGH,
                created_at: new Date(),
            }
        });
        const result = service.calculateScore(links as any, 1.0);
        expect(result.score).toBe(0);
    });
});
