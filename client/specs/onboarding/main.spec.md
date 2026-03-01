# Splash & Onboarding Screens Specification

## Overview
This document outlines the requirements and logic for the Splash and Onboarding screens in the SafeMe client application.

## Logic Flow
Upon app launch, the initial route must determine which screen to show based on the user's local state:

1. **First-time Install**: If this is the first time the user has opened the app, show the **Onboarding Screens**.
2. **Returning User (Not Signed In)**: If it is not a first-time install, but the user is not authenticated, show the **Splash Screen** followed by the login/auth flow.
3. **Returning User (Signed In)**: If the user is authenticated, briefly show the **Splash Screen** while restoring session data, then navigate to the Home screen.

## Splash Screen Requirements
- **Logo**: A prominently centered brand logo.
- **Marketing Caption**: A short, engaging tagline or marketing caption displayed below the logo.
- **App Version**: The current app version dynamically fetched (e.g., `v1.0.0`) displayed at the bottom of the screen.
- **Behavior**: Acts as a gateway or loading screen while the app checks for authentication and initialization states.

## Onboarding Screens Requirements
- **Purpose**: To educate new users about the core value propositions of the app.
- **Content Highlights**:
  - The app is **Safe**: Highlighting crowdsourced transport safety.
  - The app is **Alert**: Emphasizing real-time warnings about transport-related crimes.
  - The app is **Community-Driven**: Assuring a network of users looking out for each other.
- **Navigation**:
  - Ability to swipe through screens.
  - A "Skip" button to jump to the login/signup flow.
  - A "Get Started" button on the final slide to proceed to the login/signup flow.
