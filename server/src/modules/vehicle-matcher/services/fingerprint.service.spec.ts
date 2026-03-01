import { Test, TestingModule } from '@nestjs/testing';
import { FingerprintService } from './fingerprint.service';
import { TransportType } from '../entities/vehicle-fingerprint.entity';

describe('FingerprintService', () => {
    let service: FingerprintService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FingerprintService],
        }).compile();

        service = module.get<FingerprintService>(FingerprintService);
    });

    it('should normalize plate numbers correctly', () => {
        expect(service.normalizePlate('ABC 123 XY')).toBe('ABC123XY');
        expect(service.normalizePlate('abc-123.xy')).toBe('ABC123XY');
        expect(service.normalizePlate(null)).toBeNull();
    });

    it('should hash plate numbers with city salt', () => {
        const hash1 = service.hashPlate('ABC 123', 'Lagos');
        const hash2 = service.hashPlate('ABC123', 'Lagos');
        const hash3 = service.hashPlate('ABC 123', 'Abuja');

        expect(hash1).toBe(hash2);
        expect(hash1).not.toBe(hash3);
        expect(hash1).toHaveLength(64); // SHA256 hex
    });

    it('should generate simhash for similar vehicles', () => {
        const hashA = service.generateSimHash({
            make: 'Toyota',
            color: 'Silver',
            transportType: TransportType.TAXI,
            tokens: ['dent', 'roof rack'],
        });

        const hashB = service.generateSimHash({
            make: 'Toyota',
            color: 'Silver',
            transportType: TransportType.TAXI,
            tokens: ['dent', 'roof rack'],
        });

        const hashC = service.generateSimHash({
            make: 'Honda',
            color: 'Blue',
            transportType: TransportType.BUS,
            tokens: ['clean'],
        });

        expect(hashA).toBe(hashB);
        expect(hashA).not.toBe(hashC);
        expect(typeof hashA).toBe('bigint');
    });

    it('should tokenize features correctly', () => {
        const tokens = service.tokenizeFeatures('Roof rack, dent, scratched');
        expect(tokens).toContain('roof');
        expect(tokens).toContain('rack');
        expect(tokens).toContain('dent');
        expect(tokens).toContain('scratched');
        expect(tokens).not.toContain('a'); // Stopwords/small words filtered
    });
});
