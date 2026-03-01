---
description: Implement Native Client SDKs connecting to the unified backend server and handling auth
---

# Client SDK Implementation Workflow

This workflow guides the implementation of the `client-sdk.spec.md`, `client-sdk.ios.spec.md` and `client-sdk.android.spec.md` specifications.

## Phase 1: Review Specs
Review the exact expectations for the SDK on both platforms.
- Review `client/specs/client-sdk.spec.md`
- Review `client/specs/client-sdk.ios.spec.md`
- Review `client/specs/client-sdk.android.spec.md`

## Phase 2: iOS Implementation
1. **Networking Core**
   - Create a `URLSession` wrapper or configure `Alamofire`.
   - Setup Base URL configurations for environments.
2. **Auth Integration & Interceptor**
   - Integrate `FirebaseAuth`.
   - **Emulator (Local):** Configure `Auth.auth().useEmulator(withHost: "localhost", port: 9099)` in `DEBUG`.
   - Implement an interceptor pattern to asynchronous fetch `Auth.auth().currentUser?.getIDToken()` and attach as `Bearer` token.
3. **Token Revocation**
   - Catch `401 Unauthorized` responses.
   - Force `Auth.auth().signOut()`, clear local state, and redirect to Login via the State Manager.
4. **Current User Management**
   - Implement an `@Observable` model for exposing user session state to SwiftUI.

## Phase 3: Android Implementation
1. **Networking Core**
   - Create a `Retrofit` and `OkHttpClient` instance.
   - Setup Base URL configurations via `BuildConfig`.
2. **Auth Integration & Interceptor**
   - Integrate `FirebaseAuth`.
   - **Emulator (Local):** Configure `FirebaseAuth.getInstance().useEmulator("10.0.2.2", 9099)` in `DEBUG`.
   - Implement an `OkHttp` `Interceptor` to synchronously fetch the token using `Tasks.await()` and attach as `Bearer` token.
3. **Token Revocation**
   - Implement an `Authenticator` or `Interceptor` to catch `401 Unauthorized` responses.
   - Force `FirebaseAuth.getInstance().signOut()`, clear `DataStore`, and emit unauthenticated state to `StateFlow`.
4. **Current User Management**
   - Implement a Repository and `ViewModel` exposing a `StateFlow<UserSession>` to Compose.
