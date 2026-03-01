# UI/UX and Navigation Specification

## 1. Visual Design Language

### 1.1 Color Palette
* **Primary Deep Teal**: `#014342` (Backgrounds, Headers, Primary Buttons)
* **Accent Mint Green**: `#74E7B2` (Action icons, success states, highlights)
* **Risk High (Red)**: `#D32F2F` (High risk zones, SOS buttons)
* **Risk Medium (Orange)**: `#F57C00` (Medium risk zones, warnings)
* **Risk Low (Yellow/Green)**: `#AFB42B` (Low risk zones)
* **Neutral Gray**: `#F5F5F5` / `#212121` (Light/Dark backgrounds)

### 1.2 Typography
* **Primary Font**: Inter or System Default (Sans-serif)
* **Headings**: Semi-bold
* **Body**: Regular / Light

---

## 2. Navigation Architecture

### 2.1 Root Structure (Bottom Tabs)
The application uses a Persistent Bottom Tab Navigation for core features:

1. **Safety Home (Heatmap)**: 
   * Icon: `shield-map`
   * Purpose: Real-time risk visualization and localized alerts.
2. **Vehicle Check**: 
   * Icon: `car-lookup`
   * Purpose: Quick plate/feature search before boarding.
3. **Trip Guard**: 
   * Icon: `navigation-variant`
   * Purpose: Start/Monitor active trips with real-time anomaly detection.
4. **Report Incident**: 
   * Icon: `alert-circle-outline`
   * Purpose: Structured reporting of safety issues.
5. **Profile**: 
   * Icon: `account-outline`
   * Purpose: History, emergency contacts, and settings.

### 2.2 Deep Linking & Modal Flows
* **Active Trip**: When a trip is started, the bottom tab persists but a floating "Trip Active" bar or full-screen overlay (Trip Guard) becomes the primary focus.
* **SOS Flow**: Triggerable from any screen via a long-press or dedicated hardware shortcut (where supported).

---

## 3. Core Screen Logic

### 3.1 Safety Home
* **Map Integration**: MapBox or Google Maps with H3 Hexagon overlay (from `/risk/tiles`).
* **Real-time Marker**: Pulse around user location indicating local risk score (from `/risk/here`).
* **Search**: Search for specific areas to check risk before traveling.

### 3.2 Vehicle Matcher UI
* **Camera Scanner**: OCR implementation for plate recognition (fallback).
* **Manual Input**: Multi-step form for Plate -> Make -> Color -> Distinctive Features.
* **Result Card**: "Trust Score" meter (0-100) with breakdown (e.g., "3 Previous sightings", "1 Flagged Incident").

### 3.3 Trip Guard UI
* **Setup**: Destination input -> Route preview with Risk Score -> "Start Safe Trip".
* **Active State**: Live polyline tracking -> "Signal Loss" or "Off-route" full-screen warnings.
* **Ending**: Secure Pin/Biometric to end trip (prevents forced cancellation).

### 3.4 Report Incident UI
* **Wizard Flow**: Type of Incident -> Vehicle Details (linked to Matcher) -> Location (Map Pin) -> Narrative Description.
* **Confirmation**: "Report Submitted - Improving safety for Lagos".

---

## 4. UI/UX Principles
* **Low Friction**: One-handed usability for urgent situations (SOS, reporting).
* **High Contrast**: Ensure legibility in bright sunlight (common in Nigeria).
* **Immediate Feedback**: Loading states for all API calls; tactile feedback for safety triggers.
