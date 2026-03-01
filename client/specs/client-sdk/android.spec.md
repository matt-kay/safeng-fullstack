# Client SDK Android Specification

## Overview
This document outlines the Android-specific implementation of the Client SDK for the SafeMe application, adhering to the core responsibilities defined in the main `client-sdk.spec.md`.

## Technologies
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **HTTP Client**: `Retrofit` with `OkHttp` (or `Ktor`)
- **Authentication**: Firebase Authentication SDK for Android
- **State Management**: `StateFlow` / `ViewModel` (Android Architecture Components)

## Implementation Details

### 1. API Gateway Connectivity
- Implement a centralized `Retrofit` and `OkHttpClient` instance.
- Configure environment-specific base URLs (Dev, Staging, Prod) via Build Variants (`BuildConfig`).

### 2. Authentication Flow
- Integrate Firebase Auth to handle phone number verification and sign-in.
- Ensure profile synchronization with the SafeMe `auth-service` via backend API calls exposing suspend functions.

### 3. Current User Management
- Create a globally accessible repository or use a scoped `ViewModel` exposing a `StateFlow<UserSession>` to Jetpack Compose screens.
- Cache user session data securely using `EncryptedSharedPreferences` or `DataStore` for immediate UI rendering on app launch.

### 4. Token Management & Revocation
- Implement an `OkHttp` `Interceptor` to fetch the Firebase Auth ID Token synchronously block (using `Tasks.await()`) and inject it into the `Authorization` header (`Bearer <token>`).
- Implement an `OkHttp` `Authenticator` or another interceptor to catch `401 Unauthorized` HTTP responses.
- On `401`, call `FirebaseAuth.getInstance().signOut()`, clear local `DataStore`/caches, and emit an unauthenticated state to the session `StateFlow` to trigger a Jetpack Compose navigation redirect to the Login screen.
