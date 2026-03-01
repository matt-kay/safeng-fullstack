# Trip Guard Technical Specification

## 1. Overview
**Trip Guard** is a real-time monitoring system designed to protect users during active journeys. It analyzes telemetry data, detects anomalies (deviations, isolation, signal loss), evaluates trip-level risk, and triggers automated escalations (SOS) when threats are detected.

---

## 2. Data Model (Postgres + PostGIS)

### 2.1 Trips (`trips`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Unique trip identifier |
| `user_id_hash` | `varchar` | SHA-256 hashed user ID |
| `city` | `varchar` | City name for risk context |
| `start_location` | `geography(Point)` | GPS coordinates of trip start |
| `destination` | `geography(Point)` | GPS coordinates of trip destination |
| `expected_route` | `geography(LineString)` | Computed optimal path |
| `baseline_risk` | `float` | Risk score at start (from Risk Engine) |
| `current_risk` | `float` | Real-time evaluated risk |
| `status` | `enum` | active, completed, cancelled, escalated |
| `started_at` | `timestamp` | UTC start time |
| `ended_at` | `timestamp` | UTC end time |

### 2.2 Telemetry (`trip_telemetry`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `bigserial` (PK) | Unique record ID |
| `trip_id` | `uuid` (FK) | Reference to `trips` |
| `location` | `geography(Point)` | User's current location |
| `speed` | `float` | Current speed in m/s |
| `heading` | `float` | Movement direction (0-359) |
| `network_state` | `varchar` | online, offline, weak |
| `timestamp` | `timestamp` | Device-recorded time |

---

## 3. Monitoring & Anomaly Detection

### 3.1 Route Deviation
* **Logic:** Computes the perpendicular distance from current location to `expected_route`.
* **Thresholds:**
  - > 200m: Warning (Flagged)
  - > 500m: High Risk (Potential abduction/detour)

### 3.2 Isolation Stops
* **Logic:** Detects when a vehicle stops for > 3 minutes in a high-risk or low-density area.
* **Logic:** Cross-references with Risk Engine's grid data.

### 3.3 Signal Loss Patterns
* **Logic:** Monitors gaps between telemetry batches.
* **Criteria:** Loss of signal for > 5 minutes in a non-blackout zone triggers an automatic check-in request.

---

## 4. API Endpoints

### 4.1 Start Trip
* **Method:** `POST`
* **Path:** `/trip/start`
* **Body:** `StartTripDto` (city, startLat, startLng, destLat, destLng)
* **Returns:** `tripId`, `expectedPolyline`, `baselineRisk`

### 4.2 Batch Telemetry
* **Method:** `POST`
* **Path:** `/trip/telemetry`
* **Body:** `BatchTelemetryDto` (tripId, points[])
* **Constraint:** Devices should batch points (e.g., every 30s) to save battery.

### 4.3 Trigger SOS
* **Method:** `POST`
* **Path:** `/sos/trigger`
* **Body:** `TriggerSosDto` (tripId, encryptedPayload)
* **Encryption:** `encryptedPayload` contains sensitive user status, accessible only by responders.

---

## 5. Escalation Flow (Silent SOS)
1. **Trigger:** Manual (via app) or Automated (Critical Anomaly).
2. **First Responders:** Alert nearby security/patrol units via `EscalationService`.
3. **Emergency Contacts:** SMS/Push notifications sent to user-defined contacts.
4. **Responders Dashboard:** Real-time location and hardware-encrypted payload decrypted for high-level clearance responders.

---

## 6. Privacy & Security
* **User Anonymity:** `user_id` is hashed locally/at gateway; the Trip Guard module only sees `user_id_hash`.
* **Encrypted SOS:** All SOS payloads are encrypted using RSA/EC public keys before transmission.
* **Data Retention:** Telemetry data is purged 48 hours after a trip completes successfully, unless flagged or escalated.
