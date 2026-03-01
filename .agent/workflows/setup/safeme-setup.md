---
description: initialize the safeme application and setup the core native architectures
---

# SafeMe Native App Setup Workflow

This workflow sets up the SafeMe native applications tailored to the `setup.spec.md`, `setup.ios.spec.md`, and `setup.android.spec.md`.

## Phase 1: Review Specs
Review the core platform requirements and brand guidelines.
- Review `client/specs/setup/main.spec.md`
- Review `client/specs/setup/ios.spec.md`
- Review `client/specs/setup/android.spec.md`

## Phase 2: iOS Initialization (Xcode)
1. **Create the iOS Project**
   - Use Xcode to create a new iOS App.
   - Bundle Identifier: `com.scitylana.safeme`
   - UI: SwiftUI
2. **Setup Dependencies**
   - Add Firebase SDK (Auth, Crashlytics, Analytics) via Swift Package Manager.
3. **Architecture Basics**
   - Create directories: `Features/Auth`, `Features/Home`, `Core/Network`, `Core/Theme`.

## Phase 3: Android Initialization (Android Studio)
1. **Create the Android Project**
   - Use Android Studio to create an "Empty Activity" Compose project.
   - Application ID: `com.scitylana.safeme`
2. **Setup Dependencies**
   - Add Firebase BoM to `libs.versions.toml` or `build.gradle.kts` (Auth, Crashlytics, Analytics).
   - Add Retrofit and OkHttp.
3. **Architecture Basics**
   - Create package structures: `feature.auth`, `feature.home`, `core.network`, `core.theme`.

## Phase 4: Local Development Setup
- **Firebase Emulators:** Ensure `FirebaseAuth` is configured to use the local emulator on port 9099 (`localhost` for iOS, `10.0.2.2` for Android) within the `AppDelegate` or `MainActivity` when Build is `DEBUG`.

## Phase 5: Theme Configuration
- Apply the brand colors (`#014342`, `#74E7B2`) to the iOS `Assets.xcassets` and Android `Color.kt`/`Theme.kt`.