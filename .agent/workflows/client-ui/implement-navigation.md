---
description: Implement Root Navigation and Bottom Tabs for SafeMe
---

1. **Install Dependencies**:
   Ensure `react-navigation` (or native equivalent like `com.google.android.material.bottomnavigation`) is configured.

2. **Configure Navigation Theme**:
   Apply `#014342` to the Header and Tab Bar background. Use `#74E7B2` for active icon tints.

3. **Define Bottom Tab Stack**:
   Implement a `MainTabNavigator` with the following routes:
   - `Home`: Safety Home (Heatmap)
   - `VehicleCheck`: Vehicle Matcher
   - `TripGuard`: Active Trip Monitoring
   - `Incidents`: Incident Reporting
   - `Profile`: User Account & History

4. **Setup Shared Stack Passwords**:
   Ensure the `Auth` stack transitions seamlessly into the `MainTabNavigator` after login/onboarding.

5. **Deep Linking**:
   Configure URI schemes for `safeme://risk-here` and `safeme://active-trip`.
