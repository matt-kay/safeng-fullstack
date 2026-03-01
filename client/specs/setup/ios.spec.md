# SafeMe iOS Setup Specification

## Overview
This document outlines the iOS-specific project setup and environment configuration for the SafeMe mobile application.

## Core Requirements
1. **Target Platform**: iOS 16.0+
2. **Language**: Swift 5.9+
3. **UI Framework**: SwiftUI
4. **Architecture**: MVVM with Feature-Driven grouping (e.g., `Features/Auth`, `Features/Home`, `Core/Network`).
5. **State Management**: `@Observable` macro (iOS 17+) or `ObservableObject`.
6. **Routing**: `NavigationStack` with an enumeration-based router for deep linking.
7. **Dependency Manager**: Swift Package Manager (SPM) or CocoaPods.

## Setup Steps
1. **Initialize Xcode Project**:
   - Create a new iOS App project in Xcode.
   - Bundle Identifier: `com.scitylana.safeme`.
   - Interface: SwiftUI.
   - Language: Swift.
2. **Environment Configuration (Flavors)**:
   - Create multiple Xcode Configurations (Debug, Release) mapped to User-Defined build settings or `.xcconfig` files for Dev, Staging, and Prod.
3. **Add Dependencies**:
   - Add Firebase SDK via SPM (`FirebaseAuth`, `FirebaseCrashlytics`, `FirebaseAnalytics`).
   - Add networking libraries if avoiding pure `URLSession` (e.g., `Alamofire`).
4. **Theme Configuration**:
   - Define Color Sets in `Assets.xcassets` emphasizing  `#014342` and `#74E7B2` with Dark Mode alternates.
   - Create a `Theme.swift` file for design system typographies and constants.
5. **Firebase Initialization**:
   - Integrate `GoogleService-Info.plist` for respective environments.
   - Initialize in `App` struct via `@UIApplicationDelegateAdaptor` or `init()`.
6. **Deep Linking Setup**:
   - Enable Associated Domains (`applinks:safeme.com`) in Signing & Capabilities.
   - Handle incoming URLs via `.onOpenURL` modifier.
