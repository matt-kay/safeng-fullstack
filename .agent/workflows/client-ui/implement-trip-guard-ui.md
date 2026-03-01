---
description: Implement Trip Guard UI and Telemetry Monitoring
---

1. **Trip Initialization UI**:
   - Destination Selection Screen.
   - Fetch Route and baseline risk from `/trip/start`.
   - Render the `expectedPolyline` on the map.

2. **Active Monitoring View**:
   - Display a floating "Protecting You" dashboard.
   - Live ETA and Speed indicators.
   - Persistent SOS button in the bottom right corner.

3. **Anomaly Alerts**:
   - Implement listeners for route deviation (>200m).
   - Show a full-screen "Are you safe?" overlay with a 10s countdown if an anomaly is detected.

4. **SOS Flow**:
   - Connect long-press (3s) to `POST /sos/trigger`.
   - Encrypt the user's current context (lat/lng, city, status) before sending.

5. **Trip Termination**:
   - "End Trip" button requiring a Biometric/FaceID or 4-digit PIN confirmation.
