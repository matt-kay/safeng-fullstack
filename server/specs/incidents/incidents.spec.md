# Incident Reporting Technical Specification

## 1. Overview
The **Incidents** module handles the structured reporting of safety incidents, validates reporting data, manages verification statuses, and triggers events for the Risk Engine and SOS services.

---

## 2. Data Model (PostgreSQL)

### 2.1 Incident Reports (`incident_reports`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Unique incident ID |
| `city` | `varchar` | City of occurrence |
| `grid_cell_id` | `varchar` | H3 or stable grid cell ID |
| `incident_type` | `enum` | theft, robbery, harassment, accident, etc. |
| `transport_type`| `enum` | taxi, bus, keke, ride_hailing, private |
| `vehicle_color` | `varchar` | Reported vehicle color |
| `plate_partial` | `varchar` | Partial license plate (last 3-4 chars) |
| `outcome` | `enum` | escaped, harmed, loss_of_property, etc. |
| `threat_indicators`| `jsonb` | Specific flags (tinted, weapons, etc.) |
| `reporter_hash` | `varchar` | SHA-256 hash of reporter device/user ID |
| `verified_status`| `enum` | unverified, corroborated, verified |
| `created_at` | `timestamp` | UTC creation time |

---

## 3. Anti-Spam & Heuristics

### 3.1 Rate Limiting
- **Per Reporter:** Max 3 reports per 24 hours per `reporter_hash`.
- **Global:** Throttling based on city/grid density to prevent flood attacks.

### 3.2 Corroboration Rule
- If **N (default 3)** reports of the same `incident_type` occur within the same `grid_cell_id` within **X (default 12)** hours, the status is automatically updated from `unverified` to `corroborated`.

---

## 4. API Endpoints

### 4.1 Create Incident
- **Method:** `POST`
- **Path:** `/incidents`
- **Body:** `CreateIncidentDto`
- **Logic:**
  1. Validates enums and geo-bounds.
  2. Assigns `grid_cell_id` based on coordinates.
  3. Checks for duplicates (same reporter, same cell, recent).
  4. Publishes `incident.created` event to Pub/Sub.

---

## 5. Security & Privacy
- **Anonymous Reporting:** Only `reporter_hash` is stored to prevent tracking while allowing anti-abuse.
- **Data Minimization:** Raw coordinates are used for grid assignment but not stored in the `incident_reports` table (only `grid_cell_id`).
