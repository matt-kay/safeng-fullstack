# Client Feature Implementation Specifications

This document defines the functional requirements and API integration logic for the primary features in the SafeMe client application.

## 1. Risk Heatmap Dashboard (Safety Home)
*   **API Connection**: `GET /risk/tiles`
*   **User Location Connection**: `GET /risk/here`
*   **Key Functionality**:
    *   **H3/Grid Rendering**: Render hexagon/grid overlays on a map. Color code based on `risk_score` (0-10).
    *   **Local Pulse**: A floating card showing the "Risk Meter" for the current grid cell.
    *   **Area Search**: Search field to check risk at a specific destination.
*   **State Management**:
    *   `currentGridData`: Array of grid objects with risk scores.
    *   `userLocalRisk`: Object containing the score and level (low/medium/high) for the current lat/lng.

## 2. Vehicle Trust Checker
*   **API Connection**: `POST /vehicle/check`
*   **Key Functionality**:
    *   **Form Logic**: Validates `plate` (normalized) or `platePartial`.
    *   **Matching UI**: Show "Matching..." animation while querying backend.
    *   **Trust Result**: Display a prominent circular gauge (0-100) with supporting details:
        *   "Last Seen: 2 hours ago"
        *   "Associated with 2 high-risk reports" (Warning banner).
*   **Camera Integration**: OCR utility to extract license plate text and auto-fill the form.

## 3. Trip Guard (The "Protector")
*   **API Connections**: 
    *   `POST /trip/start`
    *   `POST /trip/telemetry` (Batch)
    *   `POST /sos/trigger`
*   **Key Functionality**:
    *   **Trip Initialization**: Post user destination and get `expectedPolyline`.
    *   **Telemetry Loop**: Capture GPS every 5s, batch and send every 30s.
    *   **Client-Side Anomaly Monitoring**:
        *   **Distance Check**: Alert user if distance from `expectedPolyline` > 200m.
        *   **Static Stop Check**: If speed = 0 for > 3min in high-risk zone, trigger a "Safe Check-in" prompt.
    *   **SOS Trigger**: Floating red button with 3s press-and-hold to prevent accidental triggers.

## 4. Community Incident Reporting
*   **API Connection**: `POST /incidents`
*   **Key Functionality**:
    *   **Report Entry**: Structured multi-page form.
        1.  **Type Selector**: (Theft, Kidnapping Attempt, Harassment, etc.)
        2.  **Vehicle Details**: Quick-link to the Vehicle Matcher logic.
        3.  **Location**: Drag-and-drop pin on map.
        4.  **Security Question**: (e.g., "Are you in a safe place now?").
*   **Feedback**: Show "Thank you" screen with safety tips based on the report type.

## 5. Offline Connectivity Management
*   **Logic**:
    *   Queue `trip/telemetry` and `incidents` locally if network is lost.
    *   Sync when connection is restored.
    *   Show "Offline Mode" banner on the Map.
