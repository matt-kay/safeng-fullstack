# Safer Pickup Recommender Technical Specification

## 1. Overview
The **Pickup** module suggests safer alternatives for ride-hailing or public transport pickups within a user-specified radius, based on historical risk data and infrastructure quality.

---

## 2. Scoring Logic

### 2.1 Candidate Score Formula
```
score = (grid_risk * 0.5) + (corridor_risk * 0.3) + (time_weight * 0.2)
```
- **grid_risk:** Derived from the Risk Engine for the specific cell.
- **corridor_risk:** Risk level of adjacent main roads.
- **time_weight:** Adjusts for visibility/activity levels based on the hour.

---

## 3. API Endpoints

### 3.1 Recommend Pickup Points
- **Method:** `GET`
- **Path:** `/pickup/recommend`
- **Query Params:** `city`, `lat`, `lng`, `radius_m`, `time`
- **Response:**
  - List of 3-5 candidates with `label`, `lat`, `lng`, `risk_score`, and `reason` (e.g., "Higher visibility", "Lower 30d incident density").

---

## 4. Integration
- **Risk Engine:** Consumes `/risk/here` and `/risk/tiles` to evaluate candidate points.
- **GIS Services:** Uses PostGIS `ST_DWithin` to find candidates within the radius.
