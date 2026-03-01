---
description: Implement Risk Dashboard (Safety Home) with H3 Heatmaps
---

1. **Map Setup**:
   Initialize Mapbox/Google Maps view centered on the user's current city (Abuja, Lagos, etc.).

2. **Integration with /risk/tiles**:
   - Create a service to fetch `/risk/tiles` based on map `bbox` and `zoom`.
   - Use a Hexagon Layer or Polystyle to render H3 grid cells.

3. **Dynamic Coloring**:
   Map `risk_score` (0-10) to the safety color palette:
   - 0-2: Green
   - 3-5: Yellow/Orange
   - 6-10: Red

4. **"Risk Here" Pulse**:
   - Implement a polling effect that calls `/risk/here` every 30-60 seconds.
   - Update the "Safety Alert" bottom card with the current location's risk level.

5. **Search Interaction**:
   When a user searches for a destination, zoom to the location and highlight the risk score for that area.
