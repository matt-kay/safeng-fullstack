# SafeMeNG App Setup Specification

## Overview
SafeMeNG is a crowdsourced + predictive transport safety intelligence platform designed to reduce “one-chance” and transport-related crimes in Nigerian cities such as Abuja, Lagos, Port Harcourt, and Kano.
The mobile app will be built natively, targeting iOS and Android platforms.

## Brand Guidelines
- **Primary Colors**:
  - `#014342`
  - `#74E7B2`

## Core Requirements
1. **Target Platforms**: iOS and Android.
2. **Architecture**: Feature-Driven Architecture (or modular architecture) separating Core components from Features.
3. **State Management**: Use modern, reactive, platform-specific state management.
4. **Routing**: Use modern navigation frameworks to support deep linking and advanced navigation flows.
5. **Backend Integration**: Firebase (Authentication, Crashlytics, Analytics), REST API via API Gateway.
6. **Themeing & Styling**: Support for both Light and Dark modes. The deep red and orange should be prominent accents.
7. **Localization**: Setup English only.
8. **Environment Configuration**: Set up flavors/build configurations (Development, Staging, Production).

## Core Setup Steps
1. **Initialize Project**:
   Create the base native project specifying the organization bundle identifier `com.scitylana.safeme`.
2. **Add Dependencies**:
   Configure the platform's package manager with required foundational libraries (Networking, State Management, UI architecture).
3. **Folder Structure**:
   Set up the basic folder structure following a Feature-Driven/Clean Architecture approach.
4. **Theme Configuration**:
   Create base theme and color palette files incorporating the Brand Colors (`#014342`, `#74E7B2`) and Light/Dark Mode support.
5. **Firebase Initialization**:
   Initialize Firebase using the appropriate platform-specific configuration files (`GoogleService-Info.plist` or `google-services.json`).
6. **Deep Linking Preparation**:
   Implement basic native configurations for Deep Linking (Universal Links for iOS and App Links for Android).
