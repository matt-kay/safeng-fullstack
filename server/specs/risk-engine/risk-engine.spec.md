# Risk Engine Technical Specification

## 1. Overview
The **Risk Engine** computes location-based risk scores (0–10), generates grid-based heatmap tiles, and analyzes route risk. It prevents raw incident coordinate exposure by aggregating data into stable grid cells.

---

## 2. Data Model (Postgres + PostGIS)

### 2.1 Hotspot Grid (`hotspot_grid`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `grid_cell_id` | `varchar` (PK) | H3 or stable grid ID |
| `city` | `varchar` | Indexed city name |
| `centroid` | `geography(Point)` | Cell center (not exposed raw) |
| `rolling_7d` | `int` | Incidents in last 7 days |
| `rolling_30d` | `int` | Incidents in last 30 days |
| `rolling_90d` | `int` | Incidents in last 90 days |
| `last_24h` | `int` | Incidents in last 24 hours |
| `baseline_hour_avg`| `float` | Typical incident count for the hour |
| `time_of_day_weight`| `float` | Multiplier for specific time buckets |
| `risk_score` | `float` | Computed score (0–10) |
| `risk_level` | `enum` | low, medium, high |
| `last_updated` | `timestamp` | UTC update time |

### 2.2 Route Segment Risk (`route_segment_risk`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `segment_id` | `varchar` (PK) | Stable road segment ID |
| `city` | `varchar` | City name |
| `geom` | `geometry(LineString)`| Segment geometry |
| `hour_of_day` | `int` | 0-23 |
| `day_of_week` | `int` | 0-6 (0=Sun) |
| `risk_score` | `float` | Computed risk |

---

## 3. Scoring Formula

### 3.1 Base Formula (0–10)
```
Score = clamp(
  0.30 * Density
  + 0.20 * Recency Spike
  + 0.15 * Vehicle Similarity
  + 0.15 * Route Deviation Probability
  + 0.10 * Time of Day
  + 0.10 * Reporter Confidence
) * 10
```

### 3.2 Recency Spike Calculation
```
Spike = clamp((last_24h - baseline) / (baseline + 1.0), 0, 1)
```

---

## 4. API Endpoints

### 4.1 Get Risk Tiles
* **Method:** `GET`
* **Path:** `/risk/tiles`
* **Query Params:** `city`, `bbox` (minLng,minLat,maxLng,maxLat), `zoom`, `timebucket`
* **Caching:** Redis (`risk:{city}:{zoom}:{bboxHash}:{timebucket}`) for 5 minutes.

### 4.2 Risk Here (Single Point)
* **Method:** `GET`
* **Path:** `/risk/here`
* **Query Params:** `city`, `lat`, `lng`, `time` (optional)
* **Logic:** Finds the nearest grid cell within 200m and returns components.

### 4.3 Route Risk
* **Method:** `GET`
* **Path:** `/risk/route`
* **Query Params:** `city`, `polyline` (Encoded), `time`
* **Logic:** Intersects polyline with `route_segment_risk` and returns weighted average.

---

## 5. Background Jobs (BullMQ)

### 5.1 Hourly Rollup
* **Queue:** `risk-rollup`
* **Task:** `hourly-rollup`
* **Action:** Aggregates raw incidents into `hotspot_grid` counters and recomputes `risk_score`.

### 5.2 30-min Spike Check
* **Queue:** `risk-rollup`
* **Task:** `spike-update`
* **Action:** Updates `recency_spike` normalization across high-activity cities.

---

## 6. Privacy & Security
* **No Raw Pins:** Never return raw incident coordinates.
* **Grid Centroids:** Only return grid centroids for heatmap rendering.
* **Anonymity:** Ensure risk scores cannot be linked back to specific reporters via the public API.
