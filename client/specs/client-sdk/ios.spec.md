# Client SDK iOS Specification

## Overview
This document outlines the iOS-specific implementation of the Client SDK for the SafeMe application, adhering to the core responsibilities defined in the main `client-sdk.spec.md`.

## Technologies
- **Language**: Swift
- **UI Framework**: SwiftUI
- **HTTP Client**: `URLSession` (or `Alamofire`)
- **Authentication**: `FirebaseAuth` (Firebase SDK for iOS)
- **State Management**: `@Observable` (iOS 17+) or `Combine` / `ObservableObject`

## Implementation Details

### 1. API Gateway Connectivity
- Implement a centralized networking service using `URLSession`.
- Configure environment-specific base URLs (Dev, Staging, Prod).

### 2. Authentication Flow
- Integrate `FirebaseAuth` to handle phone number verification and sign-in.
- Ensure profile synchronization with the SafeMe `auth-service` via backend API calls.

### 3. Current User Management
- Create an `Observable` user session manager to expose the core user state and authentication status to SwiftUI views.
- Cache user session data using `UserDefaults` or `Keychain` for immediate UI rendering on app launch.

### 4. Token Management & Revocation
- Implement a request interceptor or middleware for `URLSession` to fetch the Firebase Auth ID Token asynchronously (`currentUser.getIDToken()`) and inject it into the `Authorization` header (`Bearer <token>`).
- Subclass or wrap the networking client to centrally catch `401 Unauthorized` responses.
- On `401`, call `try? Auth.auth().signOut()`, clear local caches, and update the session manager state to trigger a SwiftUI navigation redirect to the Login view.
