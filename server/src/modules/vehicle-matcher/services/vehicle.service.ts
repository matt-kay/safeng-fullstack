import { Injectable, Logger } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { IncidentLinkRepository } from '../repositories/incident-link.repository';
import { FingerprintService } from './fingerprint.service';
import { SimilarityService } from './similarity.service';
import { TrustScoreService } from './trust-score.service';
import { TransportType, VehicleFingerprint } from '../entities/vehicle-fingerprint.entity';

@Injectable()
export class VehicleService {
    private readonly logger = new Logger(VehicleService.name);

    constructor(
        private vehicleRepo: VehicleRepository,
        private linkRepo: IncidentLinkRepository,
        private fingerprintService: FingerprintService,
        private similarityService: SimilarityService,
        private trustScoreService: TrustScoreService,
    ) { }

    async checkVehicle(data: {
        city: string;
        plate?: string;
        platePartial?: string;
        vehicleMake?: string;
        vehicleColor?: string;
        transportType?: TransportType;
        tintedWindows?: boolean;
        distinctiveFeatures?: string;
    }) {
        const plateHash = this.fingerprintService.hashPlate(data.plate, data.city) || undefined;
        const partialHash = this.fingerprintService.hashPartialPlate(data.platePartial || data.plate) || undefined;
        const tokens = this.fingerprintService.tokenizeFeatures(data.distinctiveFeatures || '');
        const simHash = this.fingerprintService.generateSimHash({
            make: data.vehicleMake,
            color: data.vehicleColor,
            transportType: data.transportType,
            tinted: data.tintedWindows,
            tokens,
        });

        let bestMatch: VehicleFingerprint | null = null;
        let matchType: 'exact' | 'partial' | 'simhash' = 'simhash';
        let confidence = 0;

        // 1. Try exact plate match
        if (plateHash) {
            bestMatch = await this.vehicleRepo.findByPlateHash(data.city, plateHash);
            if (bestMatch) {
                matchType = 'exact';
                confidence = this.similarityService.calculateConfidence('exact');
            }
        }

        // 2. Try partial plate match
        if (!bestMatch && partialHash) {
            bestMatch = await this.vehicleRepo.findByPartialHash(data.city, partialHash);
            if (bestMatch) {
                matchType = 'partial';
                confidence = this.similarityService.calculateConfidence('partial');
            }
        }

        // 3. Try SimHash similarity
        if (!bestMatch && simHash > 0n) {
            const similar = await this.vehicleRepo.findSimilarBySimHash(data.city, simHash, 5);
            if (similar.length > 0) {
                bestMatch = similar[0].vehicle;
                matchType = 'simhash';
                confidence = this.similarityService.calculateConfidence('simhash', similar[0].distance);
            }
        }

        // If no match found, create a new fingerprint
        if (!bestMatch) {
            const newFingerprint = this.vehicleRepo.create({
                city: data.city,
                plate_hash: plateHash,
                plate_partial_hash: partialHash,
                vehicle_make: data.vehicleMake,
                vehicle_color: data.vehicleColor,
                transport_type: data.transportType,
                tinted_windows: data.tintedWindows,
                distinctive_tokens: tokens,
                simhash: simHash,
                sightings_count: 1,
            });
            bestMatch = await this.vehicleRepo.save(newFingerprint);
            confidence = 1.0;
        } else {
            // Increment sightings
            bestMatch.sightings_count += 1;
            await this.vehicleRepo.save(bestMatch);
        }

        // Get linked incidents
        const links = await this.linkRepo.findByVehicleId(bestMatch.id);
        const { score, incidentCount } = this.trustScoreService.calculateScore(links, confidence);

        return {
            trustScore: score,
            sightingsCount: bestMatch.sightings_count,
            linkedIncidentCount: incidentCount,
            firstSeen: bestMatch.first_seen,
            lastSeen: bestMatch.last_seen,
            matchConfidence: confidence,
            similarIncidents: links.map(l => ({
                gridCellId: l.incident?.grid_cell_id,
                incidentType: l.incident?.incident_type,
                riskLevel: l.incident?.severity,
            })),
        };
    }
}
