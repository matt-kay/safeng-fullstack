# 🚗 Vehicle Matcher Feature Specification (NestJS Backend)

This spec defines the **Vehicle Matcher** module responsible for:

* Vehicle fingerprinting
* Plate normalization & hashing
* Similarity matching (fuzzy + partial plate support)
* Linking vehicles to incidents
* Computing **Vehicle Trust Score (0–100)**
* Supporting fake-plate detection via similarity clustering

---

# 1. Feature Overview

The Vehicle Matcher enables:

1. Users to check a vehicle before boarding
2. Matching against previous sightings/incidents
3. Handling:
   * Full plate
   * Partial plate
   * No plate (features-only)
4. Detecting:
   * Fake/reused plates
   * Visually similar vehicles
5. Returning a **trust score (0–100)** with confidence

---

# 2. Architecture (NestJS)

```
src/modules/vehicle-matcher/
 ├── controllers/
 │     vehicle.controller.ts
 ├── services/
 │     vehicle.service.ts
 │     fingerprint.service.ts
 │     similarity.service.ts
 │     trust-score.service.ts
 ├── repositories/
 │     vehicle.repository.ts
 │     incident-link.repository.ts
 ├── dto/
 ├── entities/
 └── vehicle-matcher.module.ts
```

---

# 3. Data Model (Postgres)

---

## 3.1 vehicle_fingerprints

| Column             | Type      | Notes                      |
| ------------------ | --------- | -------------------------- |
| id                 | uuid      | PK                         |
| city               | varchar   | indexed                    |
| plate_hash         | varchar   | hashed normalized plate    |
| plate_partial_hash | varchar   | hash of last 3–4 chars     |
| vehicle_make       | varchar   |                            |
| vehicle_color      | varchar   |                            |
| transport_type     | enum      | taxi/bus/keke/ride_hailing |
| tinted_windows     | boolean   |                            |
| distinctive_tokens | text[]    | normalized tokens          |
| simhash            | bigint    | 64-bit                     |
| sightings_count    | int       |                            |
| first_seen         | timestamp |                            |
| last_seen          | timestamp |                            |

Indexes:
* (city, plate_hash)
* (city, plate_partial_hash)
* (city, simhash)
* GIN(distinctive_tokens)

---

## 3.2 vehicle_incident_links

| Column          | Type      |
| --------------- | --------- |
| vehicle_id      | uuid      |
| incident_id     | uuid      |
| severity_weight | float     |
| linked_at       | timestamp |

---

# 4. API Specification

---

## 4.1 Check Vehicle

### `POST /vehicle/check`

Request:
```json
{
  "city": "Lagos",
  "plate": "ABC 123 XY",
  "platePartial": "123",
  "vehicleMake": "Toyota",
  "vehicleColor": "Silver",
  "transportType": "taxi",
  "tintedWindows": true,
  "distinctiveFeatures": "roof rack, dent left door"
}
```

Response:
```json
{
  "trustScore": 62,
  "sightingsCount": 14,
  "linkedIncidentCount": 3,
  "firstSeen": "2025-11-01T10:00:00Z",
  "lastSeen": "2026-02-28T21:10:00Z",
  "matchConfidence": 0.82,
  "similarIncidents": [
    {
      "gridCellId": "8928308280fffff",
      "incidentType": "robbery",
      "riskLevel": "high"
    }
  ]
}
```

---

# 5. Fingerprinting Strategy

---

## 5.1 Plate Normalization
Before hashing:
- uppercase
- remove spaces
- remove hyphens
- strip non-alphanumeric

Example: `"ABC 123 XY" → "ABC123XY"`

---

## 5.2 Hashing
Use:
- SHA256(plate + city_salt)
- Store first 16–32 chars for indexing
- Never store raw plate.

---

## 5.3 Partial Plate Matching
If only last 3–4 digits known:
- Hash substring
- Search `plate_partial_hash`
- Confidence lower than full plate match.

---

## 5.4 Feature Tokenization
Convert: `"roof rack, dent left door"`
Into: `["roof", "rack", "dent", "left", "door"]`
Normalize:
- lowercase
- remove stopwords
- dedupe

---

## 5.5 SimHash (Similarity Matching)
Generate 64-bit simhash from:
- make
- color
- transport type
- distinctive tokens
- tinted flag

Used for:
- Fuzzy matching
- Fake plate detection
- Similar vehicle clustering

Similarity: `hamming_distance(simhash_a, simhash_b) <= threshold` (Recommended threshold: ≤ 5 bits difference)

---

# 6. Matching Logic

---

## 6.1 Match Priority Order
1. Exact plate_hash match
2. Partial plate match
3. SimHash similarity
4. Token overlap similarity

---

## 6.2 Match Confidence Calculation
```
confidence =
  0.6 * plate_match_strength +
  0.3 * simhash_similarity +
  0.1 * token_overlap
```

---

# 7. Trust Score (0–100)
Start at 100.

---

## 7.1 Deductions

| Factor                             | Penalty                 |
| ---------------------------------- | ----------------------- |
| Each linked high severity incident | -15                     |
| Medium severity                    | -8                      |
| Low severity                       | -4                      |
| Very recent incident (<7 days)     | +10% penalty multiplier |
| Low match confidence               | reduce impact           |

Formula:
```
score = 100
score -= Σ(severity_weight)
score *= confidence
clamp(0, 100)
```

---

# 8. Fake Plate Detection
If:
- Same simhash cluster
- Different plate_hash values
- Linked to incidents
Flag internally: `possible_plate_spoof = true` (Do not expose this publicly in MVP)

---

# 9. Incident Linking Flow
When new incident submitted:
1. Generate fingerprint from vehicle details
2. Find best matching vehicle
3. If confidence > threshold:
   * Link to existing vehicle
4. Else:
   * Create new vehicle fingerprint
Increment sightings_count.

---

# 10. Background Jobs
- **Recompute Trust Scores (Nightly)**: decay, weighting, trend penalty.
- **Vehicle Clustering Job**: Group vehicles by simhash to detect high-risk clusters / fake plates.

---

# 11. Security & Privacy
- Never store raw plate
- Never expose exact incident locations (grid cell only)
- Do not expose reporter identity
- Rate limit vehicle checks

---

# 12. Abuse Prevention
- Rate limit per IP/device
- CAPTCHA after N requests
- Monitor scraping patterns
- Audit log vehicle lookups

---

# 13. Performance Targets
- Exact lookup: < 20ms
- Partial lookup: < 50ms
- Simhash similarity: < 80ms
- Full check: < 150ms
