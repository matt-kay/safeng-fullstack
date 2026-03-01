---
description: How to maintain and implement the Trip Guard feature
---

# Trip Guard Workflow

This workflow describes the steps to maintain or extend the Trip Guard feature in the NestJS backend.

## 1. Prerequisites
- Postgres with PostGIS extension (`CREATE EXTENSION postgis;`)
- Redis instance for BullMQ background monitoring
- Integrated Risk Engine (for baseline risk assessment)

## 2. Infrastructure Setup
1. Verify essential dependencies:
   ```bash
   pnpm install @nestjs/bullmq bullmq @nestjs/typeorm typeorm
   ```
2. Configure `TripGuardModule` in `app.module.ts`.
3. Ensure `REDIS_HOST` and `REDIS_PORT` are set in `.env`.

## 3. Data Model Implementation
1. Entities are located in `src/modules/trip-guard/entities/`:
   - `trip.entity.ts`: Core trip metadata and status.
   - `telemetry.entity.ts`: High-frequency location data.
   - `sos.entity.ts`: Encrypted emergency payloads.
2. Repositories in `src/modules/trip-guard/repositories/` handle PostGIS spatial queries (e.g., `ST_Distance`).

## 4. Core Service Logic
1. **TripService**: Orchestrates trip lifecycle (Start -> Telemetry -> End/SOS).
2. **DeviationService**: Calculates spatial deviation from the expected `LineString`.
3. **AnomalyService**: Handles frequency-based and state-based detection (Signal loss, Isolation).
4. **EscalationService**: Triggers external alerts (Push, SMS) and logs critical flags.
5. **EncryptionService**: Manages the asymmetric encryption for SOS payloads.

## 5. Background Monitoring
1. **MonitoringProcessor**: Located in `src/modules/trip-guard/jobs/`.
2. It processes a background queue (`trip-monitoring`) to periodically evaluate all active trips for timeout or state anomalies without blocking the main telemetry ingestion.

## 6. Verification
1. **Unit Tests**:
   ```bash
   pnpm test src/modules/trip-guard
   ```
2. **Integration Tests (E2E)**:
   ```bash
   pnpm test:e2e test/trip-guard.e2e-spec.ts
   ```
3. **Manual Verification**:
   - Start a trip via Postman: `POST /trip/start`.
   - Send telemetry: `POST /trip/telemetry`.
   - Inspect the `trips` table to ensure `status` updates correctly on `SOS/End`.
