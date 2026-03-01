---
description: Implement Structured Incident Reporting feature in NestJS
---

Follow these steps to implement the Incident Reporting module:

1. **Setup Module Structure**
   - Create `src/modules/incidents` folder with `controllers`, `services`, `repositories`, `dto`, and `entities` subfolders.
   - Initialize `IncidentsModule`.

2. **Define Entities & Schema**
   - Create `Incident` entity in `src/modules/incidents/entities/incident.entity.ts` based on `incidents.spec.md`.
   - Setup PostGIS grid logic (e.g., using H3 or a custom grid system).

3. **Implement Repository**
   - Create `IncidentRepository` for database interactions.

4. **Internal Logic (Service)**
   - Implement `IncidentService`:
     - Create incident with grid cell assignment.
     - Implement anti-spam checks (rate limiting by device hash).
     - Implement corroboration logic (automatic state transition).

5. **API Layer**
   - Create `IncidentController`:
     - `POST /incidents` integration.

6. **Event Integration**
   - Use `PubSubService` to emit `incident.created` events.

7. **Verification**
   - Run unit tests for the service.
   - Perform integration tests for the `POST /incidents` endpoint.
