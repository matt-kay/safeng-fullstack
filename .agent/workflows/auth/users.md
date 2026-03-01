---
description: Implement User Auth and Management based on users.spec.md using DDD and GoF patterns
---

# User Auth & Management Implementation Workflow

This workflow guides the implementation of the `server/specs/users.spec.md` specification. It leverages Domain-Driven Design (DDD) to model the core domain and Gang of Four (GoF) patterns to manage complexity, object creation, and cross-cutting concerns.

create all files in server/specs

## Phase 0: Infrastructure Setup

1. **Firebase Admin SDK**
   - Initialize the Firebase application, ensuring it supports connecting to the Firebase local emulator suite during development (Auth and Firestore).

## Phase 1: Domain Modeling (DDD)

1. **Define Value Objects**
   - Create `PhoneNumber` value object ensuring it validates and standardizes to the E.164 format.
   - Create `UserRole` and `UserStatus` types or enum value objects.

2. **Define Entities**
   - Create `UserIdentity` mapping to Firebase Auth (uid, claims, display_name, phone_number, disabled).
   - Create `UserProfile` mapping to Firestore (first_name, last_name, role, status, audit fields).

3. **Define Aggregate Root**
   - Create `UserAggregate` encapsulating `UserIdentity` and `UserProfile`.
   - Embed the `EffectiveStatus` computation logic (`active`, `inactive`, `suspended`, `deleted`) directly within this aggregate.

## Phase 2: Design Patterns Application (GoF)

1. **Builder Pattern (GoF: Creational) for Aggregate Assembly**
   - Implement a `UserAggregateBuilder` to safely construct the `UserAggregate` from disparate external sources (Firebase Auth and Firestore), managing nullability gracefully when a profile document does not yet exist.

2. **Repository Pattern (DDD) coordinated via Facade (GoF: Structural)**
   - Define an `IUserRepository`.
   - Implement a `UserRepository` that acts as a Facade unifying Firebase Auth (`FirebaseAdminProvider`) and the Firestore `ProfileRepository`. This abstracts away the split DB architecture from the application layer.

3. **Strategy Pattern (GoF: Behavioral) for Authorization Rules**
   - Given the Access Rules (`deleted`, `suspended`, `inactive`, `active`), implement strategies for endpoint authorization, passing the `UserAggregate` to a `UserAccessPolicy` strategy.

4. **Decorator Pattern (GoF: Structural) for Audit Logging**
   - Wrap the admin commands and deletion methods using an `AuditLoggingDecorator`. Instead of mixing logging code with business logic, the decorator seamlessly writes to the `user_audit_logs` Firestore collection when actions are performed.

## Phase 3: Application Services / Use Cases

1. **Query Services (Reads)**
   - `GetUserProfileQuery`: Implements `GET /api/v1/me` and `GET /api/v1/users/:uid`.
   - Returns customized DTOs (Self View vs Admin View) to support Data Minimization.

2. **Command Services (Writes)**
   - `CreateUserProfileCommand`: Handles POST `/api/v1/users/profile`.
   - `UpdateUserProfileCommand`: Handles PATCH `/api/v1/me/profile`.
   - `SoftDeleteUserCommand`: Handles DELETE `/api/v1/me` and `/api/v1/admin/users/:uid`. Includes Firebase token revocation.
   - `PermanentDeleteUserCommand`: Handles hard deletion/PII scrubbing using transactional logic in Firestore.

## Phase 4: API & Security Integration

1. **Authentication Guard**
   - Intercept requests, verify Firebase ID token (signature, issuer, audience, expiry), and extract `uid`. Returns `401` on failure.

2. **Authorization & Status Guard**
   - Load the `UserProfile` (or full aggregated session) for privileged endpoints.
   - Return `403` if a suspended/deleted user attempts to act, or `404` to prevent enumeration on other uids.

3. **Controllers**
   - Scaffold the REST controllers ensuring paths match `users.spec.md` precisely. Map domain exceptions to standard HTTP error codes (`400`, `403`, `404`, `409`, `422`).

4. **Swagger API Documentation**
   - Configure `@nestjs/swagger` in `main.ts` to automatically generate OpenAPI documentation for the defined REST endpoints.
   - Restrict Swagger UI access so it is only available in development environments.

5. **Logging**
   - Install `nestjs-pino`, `pino-http`, `pino`, and `pino-pretty` (as dev dependency).
   - Configure structured logging utilizing `nestjs-pino` in `app.module.ts` and set it as the primary logger in `main.ts`.

## Phase 5: Verification

1. **Unit Testing**
   - Test `UserAggregate` effective status rules fully in isolation.
   - Test Builder and Strategy pattern edge cases.

2. **Integration Testing**
   - Run integration tests against a Firebase Emulator (Auth and Firestore).
   - Verify `AuditLoggingDecorator` successfully writes to the Firestore collection during soft deletes and updates.