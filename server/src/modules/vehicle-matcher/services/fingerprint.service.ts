import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { TransportType } from '../entities/vehicle-fingerprint.entity';

@Injectable()
export class FingerprintService {
    private readonly CITY_SALT = process.env.CITY_SALT || 'safeng_default_salt';

    normalizePlate(plate: string | null | undefined): string | null {
        if (!plate) return null;
        return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    hashPlate(plate: string | null | undefined, city: string): string | null {
        const normalized = this.normalizePlate(plate);
        if (!normalized) return null;
        return createHash('sha256')
            .update(`${normalized}:${city.toLowerCase()}:${this.CITY_SALT}`)
            .digest('hex');
    }

    hashPartialPlate(plate: string | null | undefined): string | null {
        const normalized = this.normalizePlate(plate);
        if (!normalized) return null;
        // Get last 3-4 characters as partial
        const partial = normalized.slice(-4);
        return createHash('sha256')
            .update(`${partial}:${this.CITY_SALT}`)
            .digest('hex');
    }

    tokenizeFeatures(features: string): string[] {
        if (!features) return [];
        return features
            .toLowerCase()
            .split(/[\s,]+/)
            .map(t => t.trim())
            .filter(t => t.length > 2) // Filter out small words/stopwords-like
            .filter((v, i, a) => a.indexOf(v) === i); // Dedupe
    }

    generateSimHash(data: {
        make?: string;
        color?: string;
        transportType?: TransportType;
        tokens?: string[];
        tinted?: boolean;
    }): bigint {
        const features: string[] = [];
        if (data.make) features.push(`make:${data.make.toLowerCase()}`);
        if (data.color) features.push(`color:${data.color.toLowerCase()}`);
        if (data.transportType) features.push(`type:${data.transportType}`);
        if (data.tinted) features.push('tinted:true');
        if (data.tokens) features.push(...data.tokens.map(t => `token:${t}`));

        if (features.length === 0) return 0n;

        const v = new Array(64).fill(0);

        for (const feature of features) {
            const hash = this.hashTo64Bit(feature);
            for (let i = 0; i < 64; i++) {
                const bit = (hash >> BigInt(i)) & 1n;
                v[i] += bit === 1n ? 1 : -1;
            }
        }

        let fingerPrint = 0n;
        for (let i = 0; i < 64; i++) {
            if (v[i] > 0) {
                fingerPrint |= 1n << BigInt(i);
            }
        }

        return fingerPrint;
    }

    private hashTo64Bit(input: string): bigint {
        const hash = createHash('sha256').update(input).digest();
        // Use first 8 bytes for 64-bit hash
        return hash.readBigUInt64BE(0);
    }
}
