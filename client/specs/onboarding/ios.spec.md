# Splash & Onboarding Screens iOS Specification

## Overview
This document outlines the iOS-specific implementation of the Splash and Onboarding screens for the SafeMe mobile application.

## Technologies
- **UI Framework**: SwiftUI
- **State Management**: `@AppStorage` (for UserDefaults wrapping)

## Logic Flow Implementation
- Use a root `ContentView` or a Router view to switch between the initialization states.
- **First-time Install Flag**: Use `@AppStorage("hasSeenOnboarding") var hasSeenOnboarding: Bool = false`.

## Splash Screen Implementation
- **UI**: A standard SwiftUI `View` containing `Image` for logo, `Text` for the marketing caption, and dynamically fetching the version using `Bundle.main.infoDictionary?["CFBundleShortVersionString"]`.
- **Alternative**: Utilize Xcode's Launch Screen Storyboard or Plist for the absolute initial system splash screen, matching the SwiftUI Splash View exactly for a seamless transition.
- **Behavior**: The view performs asynchronous session restoration via the Client SDK in an `.task` modifier. Wait for completion, then trigger a state change to the Home view or Login view.

## Onboarding Screens Implementation
- **UI**: Use a `TabView` with `PageTabViewStyle()` to allow swiping through the onboarding pages.
- **Components**: Create a reusable `OnboardingPageView` taking in an image, title, and description.
- **Navigation**: On "Skip" or "Get Started" tap, set `hasSeenOnboarding = true` which reactively triggers the root router to display the Login/Auth flow.
