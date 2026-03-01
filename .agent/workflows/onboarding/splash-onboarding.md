---
description: Implement Splash and Onboarding Screens for SafeMe
---

# Splash and Onboarding Implementation Workflow

This workflow guides the implementation of the splash and onboarding screens according to the native specifications.

## Phase 1: Review Specs
- Review `client/specs/onboarding/main.spec.md` (Main Flow)
- Review `client/specs/onboarding/ios.spec.md` (If iOS)
- Review `client/specs/onboarding/android.spec.md` (If Android)

## Phase 2: Storage and State Management Setup
- **iOS:** Use `@AppStorage` (`UserDefaults`) to store the "first-time install" flag.
- **Android:** Use `DataStore` (Preferences) to store the "first-time install" flag.

## Phase 3: Splash Screen Implementation
- **iOS:** 
  - Implement a standard SwiftUI `View` or customize the Xcode Launch Screen.
  - Fetch version using `Bundle.main.infoDictionary`.
  - Perform asynchronous session restoration logic, then trigger a state change to Home or Login.
- **Android:** 
  - Implement the Android 12+ `SplashScreen` API via `installSplashScreen()`.
  - Use `splashScreen.setKeepOnScreenCondition` to hold the screen while Client SDK restores the session and `DataStore` checks the onboarding flag.

## Phase 4: Onboarding Screens Implementation
- **iOS:** Use `TabView` with `PageTabViewStyle()` to allow swiping through the Safe, Alert, and Community-Driven slides.
- **Android:** Use `HorizontalPager` or Compose Pager to allow swiping through slides.
- **Completion Logic:** When "Skip" or "Get Started" is tapped, save the "first-time install" flag as `false` and navigate to the authentication screen.
