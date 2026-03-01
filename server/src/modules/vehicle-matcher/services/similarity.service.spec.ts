import { Test, TestingModule } from '@nestjs/testing';
import { SimilarityService } from './similarity.service';

describe('SimilarityService', () => {
    let service: SimilarityService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SimilarityService],
        }).compile();

        service = module.get<SimilarityService>(SimilarityService);
    });

    it('should calculate hamming distance correctly', () => {
        const a = 0b1101n;
        const b = 0b1011n;
        // XOR: 0110 => 2 bits different
        expect(service.hammingDistance(a, b)).toBe(2);
    });

    it('should calculate confidence for different match types', () => {
        expect(service.calculateConfidence('exact')).toBe(1.0);
        expect(service.calculateConfidence('partial')).toBe(0.7);

        // Distance 0 => 0.9 confidence
        expect(service.calculateConfidence('simhash', 0)).toBe(0.9);
        // Distance 10 => 0.4 confidence (0.9 - 10 * 0.05)
        expect(service.calculateConfidence('simhash', 10)).toBe(0.4);
        // Distance 20 => 0.2 confidence (cutoff)
        expect(service.calculateConfidence('simhash', 20)).toBe(0.2);
    });
});
