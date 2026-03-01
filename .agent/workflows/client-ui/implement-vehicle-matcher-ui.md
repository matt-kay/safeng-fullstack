---
description: Implement Vehicle Matcher UI (Scanner & Trust Result)
---

1. **Input Interface**:
   - Create a clean form with fields for License Plate, Color, Make, and Transport Type.
   - Add a "Scan Plate" button that triggers the device camera.

2. **Camera/OCR Integration**:
   - Implement an OCR provider (Vision Framework on iOS / ML Kit on Android) to extract text from vehicle plates.
   - Auto-fill the `plate` field and normalize (uppercase, no spaces).

3. **Match Visualization**:
   - Show a "Consulting Safety Database..." loading pulse while calling `POST /vehicle/check`.

4. **Trust Score Gauge**:
   - Implement a custom circular progress component showing the 0-100 score.
   - Use Dynamic colors: Green (>70), Orange (40-70), Red (<40).

5. **Incident History List**:
   - If `linkedIncidentCount > 0`, display a summary of previous reports (incident type only, no raw coordinates).
