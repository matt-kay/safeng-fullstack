import { Injectable } from '@nestjs/common';

@Injectable()
export class SimilarityService {
    hammingDistance(a: bigint, b: bigint): number {
        let distance = 0;
        let x = a ^ b;
        // Count set bits
        while (x > 0n) {
            if (x & 1n) distance++;
            x >>= 1n;
        }
        return distance;
    }

    calculateConfidence(matchType: 'exact' | 'partial' | 'simhash', similarityScore: number = 0): number {
        switch (matchType) {
            case 'exact':
                return 1.0;
            case 'partial':
                return 0.7;
            case 'simhash':
                // similarityScore is Hamming distance (0-64)
                // lower distance => higher confidence
                // threshold is 5 bits diff => confidence ~ 0.5 - 0.6
                if (similarityScore > 10) return 0.2;
                return Math.max(0.3, 0.9 - (similarityScore * 0.05));
            default:
                return 0.1;
        }
    }
}
