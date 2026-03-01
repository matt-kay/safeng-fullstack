---
description: Implement Login and Profile Setup Flow for BriskVTU
---
# Implement Login and Profile Setup Flow

This workflow guides the implementation of the login, phone authentication, OTP verification, and profile setup as defined in the native specifications.

## 1. Setup Prerequisites
Before implementing the code, ensure the following project configurations are set up for Firebase Phone Authentication:

- **Local Development:** Ensure both clients are configured to connect to the Firebase Auth Emulator (port 9099) when running debug builds (`localhost` for iOS, `10.0.2.2` for Android).

- **iOS Requirements**: 
  - Add the APNs Auth Key in the Firebase Console (Project Settings > Cloud Messaging).
  - In Xcode, navigate to your app target's **Signing & Capabilities** tab:
    - Add **Background Modes** and check **Remote notifications**.
  - In Xcode, navigate to your app target's **Info** tab:
    - Add a new **URL Type** and paste the `REVERSED_CLIENT_ID` from your `GoogleService-Info.plist` into the **URL Schemes** field.
- **Android Requirements**:
  - Add your app's **SHA-1** and **SHA-256** fingerprints to the Firebase Console (Project Settings > General).
  - Enable the **Play Integrity API** in the Google Cloud Console for your project.

## 2. Review the Specifications
Review the flow and UI requirements for the authentication process for the target platform:
- Review `client/specs/login-profile.spec.md` (Main Flow)
- Review `client/specs/login-profile.ios.spec.md` (If targeting iOS)
- Review `client/specs/login-profile.android.spec.md` (If targeting Android)

## 3. Implement the Login Screen
- **iOS (SwiftUI):** Create the view using `TextField` and custom `Picker` for country code. Use `FirebaseAuth` to trigger `PhoneAuthProvider.provider().verifyPhoneNumber()`.
- **Android (Compose):** Create the view using `OutlinedTextField` with a custom `VisualTransformation` for masking. Use `PhoneAuthProvider.verifyPhoneNumber()`.

## 3. Implement the Verification Code Screen (OTP)
- **iOS (SwiftUI):** Build a custom 6-digit OTP input. Call `Auth.auth().signIn(with: credential)`.
- **Android (Compose):** Build a custom 6-digit OTP `BasicTextField`. Call `FirebaseAuth.getInstance().signInWithCredential()`.
- **Backend Check:** Once Firebase Auth succeeds on either platform, call the Client SDK to check if a user record exists.
- **Routing:** 
  - User exists -> redirect to Home.
  - User does not exist -> redirect to Setup Profile Screen.

## 4. Implement the Setup Profile Screen
- Build a structured form for First Name, Last Name, and Email Address using standard platform-specific input components with proper capitalization flags.
- Implement the API call via the Client SDK to create a new user profile on the backend.
- On success, redirect to the Home screen.

## 5. Write Tests
- Write UI and unit tests according to the standard testing framework for the target platform (XCTest for iOS, Espresso/JUnit for Android).
