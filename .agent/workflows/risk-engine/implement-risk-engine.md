---
description: How to maintain and implement the Risk Engine feature
---

# Risk Engine Workflow

This workflow describes the steps to maintain or re-implement the Risk Engine feature in the NestJS backend.

## 1. Prerequisites
- Postgres with PostGIS extension (`CREATE EXTENSION postgis;`)
- Redis instance for BullMQ and Tile Caching

## 2. Infrastructure Setup
1. Ensure the following dependencies are installed:
   ```bash
   pnpm install pg typeorm @nestjs/typeorm @nestjs/bulkmq bullmq ioredis
   ```
2. Configure `TypeOrmModule` and `BullModule` in `app.module.ts`.
3. Set environment variables:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `REDIS_HOST`, `REDIS_PORT`

## 3. Data Model Implementation
1. Create Entities in `src/modules/risk-engine/entities/`:
   - `hotspot-grid.entity.ts` (Geometry: Point)
   - `route-segment-risk.entity.ts` (Geometry: LineString)
   - `city-risk-config.entity.ts`
2. Update `RiskEngineModule` to include these in `TypeOrmModule.forFeature()`.

## 4. Service Implementation
1. **ScoringService**: Implements the core 0-10 calculation and clamping.
2. **SpikeService**: Implements the recency spike normalization logic.
3. **TileService**: Handles PostGIS bounding box queries and Redis caching.
4. **SegmentService**: Handles polyline intersection queries for routes.
5. **RiskService**: Orchestrates single-point risk lookups.

## 5. Background Task Maintenance
1. Implement `RollupProcessor` in `src/modules/risk-engine/jobs/`.
2. Schedule jobs using BullMQ `repeatable` options in the module's `onModuleInit` or via a dedicated scheduler service.

## 6. Verification
1. **Build**: `pnpm run build`
2. **Postman/cURL Test**:
   - `GET /risk/tiles?city=Lagos&bbox=3.3,6.4,3.4,6.5&zoom=14`
   - `GET /risk/here?city=Lagos&lat=6.52&lng=3.37`
3. **Logs**: Check `risk-rollup` queue logs to ensure background processors are running.
