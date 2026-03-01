---
description: Implement Vehicle Matcher module in NestJS backend
---

This workflow guides the implementation of the Vehicle Matcher module, which handles vehicle fingerprinting, similarity matching, and trust score calculation.

### 1. Module Setup
- Create `vehicle-matcher` module structure:
    - `nest g module modules/vehicle-matcher`
    - `nest g service modules/vehicle-matcher/services/vehicle`
    - `nest g service modules/vehicle-matcher/services/fingerprint`
    - `nest g service modules/vehicle-matcher/services/similarity`
    - `nest g service modules/vehicle-matcher/services/trust-score`
    - `nest g controller modules/vehicle-matcher/controllers/vehicle`

### 2. Database Layer
- Define entities in `src/modules/vehicle-matcher/entities/`:
    - `VehicleFingerprint` (maps to `vehicle_fingerprints` table)
    - `VehicleIncidentLink` (maps to `vehicle_incident_links` table)
- Integrate with TypeORM in `vehicle-matcher.module.ts`.

### 3. Fingerprinting Logic
- Implement `FingerprintService`:
    - `normalizePlate(plate: string): string`
    - `hashPlate(plate: string, city: string): string`
    - `hashPartialPlate(plate: string): string`
    - `tokenizeFeatures(features: string): string[]`
    - `generateSimHash(data: any): bigint`

### 4. Matching & Similarity
- Implement `SimilarityService`:
    - `hammingDistance(a: bigint, b: bigint): number`
    - `calculateConfidence(matches: any): number`
- Implement `VehicleService` matching logic:
    - Search by `plate_hash`.
    - Fallback to `plate_partial_hash`.
    - Fallback to `simhash` similarity.

### 5. Trust Score Engine
- Implement `TrustScoreService`:
    - Calculate base score (100).
    - Deduct based on linked incident severity.
    - Apply confidence and recency multipliers.

### 6. API Implementation
- Define DTOs for `CheckVehicleRequest`.
- Implement `VehicleController.checkVehicle`.

### 7. Integration
- Link with `Incident` module to automatically associate new incidents with vehicle fingerprints.
- Setup background jobs (if using a task scheduler like `@nestjs/schedule`).

### 8. Verification
- Run unit tests for `FingerprintService` and `TrustScoreService`.
- Perform integration tests for `POST /vehicle/check`.
