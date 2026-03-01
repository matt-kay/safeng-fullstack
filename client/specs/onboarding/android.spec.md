# Splash & Onboarding Screens Android Specification

## Overview
This document outlines the Android-specific implementation of the Splash and Onboarding screens for the SafeMe mobile application.

## Technologies
- **UI Framework**: Jetpack Compose
- **State Management**: `DataStore` (Preferences)
- **Core APIs**: AndroidX Core SplashScreen API

## Logic Flow Implementation
- Use a `NavHost` where the `startDestination` is dynamically computed based on the state collected from `DataStore` and Firebase Auth.
- **First-time Install Flag**: Store a boolean `has_seen_onboarding` in Preferences `DataStore`.

## Splash Screen Implementation
- **System Bootstrapping**: Implement the Android 12+ `SplashScreen` API in `MainActivity` via `installSplashScreen()`.
- **Condition**: Use `splashScreen.setKeepOnScreenCondition { viewModel.isLoading.value }` to hold the system splash screen while the Client SDK restores the session and `DataStore` fetches the onboarding flag.
- **UI Fallback**: If a custom Compose splash screen is needed for complex animations after the system splash, implement a `SplashScreenComposable` fetching the app version from `PackageManager` or `BuildConfig.VERSION_NAME`.
- **Navigation**: After the loading state finishes, navigate to `HomeRoute`, `LoginRoute`, or `OnboardingRoute`.

## Onboarding Screens Implementation
- **UI**: Use Accompanist Pager or the official Compose `HorizontalPager` to allow swiping through the pages.
- **Components**: Create a composable for the pager items taking resources (images, strings).
- **Navigation**: On "Skip" or "Get Started" tap, update the `DataStore` preference in a coroutine and navigate to the `LoginRoute`, popping the onboarding route to prevent back-navigation.
