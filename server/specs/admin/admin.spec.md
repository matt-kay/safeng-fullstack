# Admin Dashboard Technical Specification

## 1. Overview
The **Admin** module provides authorized personnel with tools to monitor system-wide safety trends, verify incident reports, and export data for analysis.

---

## 2. Security & Guardians
- **Role-Based Access Control (RBAC):** All `/admin/*` endpoints require a JWT with the `admin` role.
- **Audit Logging:** Every administrative action is logged (who, when, what changed).

---

## 3. API Endpoints

### 3.1 Overview Stats
- **Method:** `GET`
- **Path:** `/admin/overview`
- **Returns:** Total incidents, 7d/30d trends, top 5 high-risk grid cells, and system health status.

### 3.2 List Incidents
- **Method:** `GET`
- **Path:** `/admin/incidents`
- **Query Params:** `status`, `city`, `type`, `limit`, `offset`
- **Description:** Paginated view for moderators to review reports.

### 3.3 Verify Incident
- **Method:** `POST`
- **Path:** `/admin/incidents/:id/verify`
- **Description:** Sets `verified_status` to `verified`.

### 3.4 Data Export
- **Method:** `GET`
- **Path:** `/admin/export`
- **Logic:**
  1. Triggers an asynchronous job to generate a CSV.
  2. Uploads the file to Cloud Storage.
  3. Returns a signed URL to the admin.

---

## 4. Infrastructure
- **Cloud Storage:** Used for storing generated CSV reports.
- **BullMQ:** Handlers for long-running export jobs.
