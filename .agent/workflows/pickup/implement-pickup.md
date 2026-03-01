---
description: Implement Safer Pickup Recommender module in NestJS
---

Follow these steps to implement the Pickup Recommender module:

1. **Setup Module Structure**
   - Create `src/modules/pickup` folder.
   - Initialize `PickupModule`.

2. **Scoring Engine**
   - Implement `PickupScoringService`:
     - Scoring formula integration (grid risk + corridor risk).
     - Fetch data from `RiskEngineService`.

3. **GIS Integration**
   - Implement radius search using PostGIS `ST_DWithin` to find candidate points.

4. **API Layer**
   - Create `PickupController`:
     - `GET /pickup/recommend` integration.

5. **Verification**
   - Test scoring accuracy against mock grid data.
   - Verify coordinate calculations and radius search.
