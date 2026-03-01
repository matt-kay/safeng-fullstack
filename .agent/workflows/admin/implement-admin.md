---
description: Implement Admin Dashboard feature in NestJS
---

Follow these steps to implement the Admin module:

1. **Setup Module Structure**
   - Create `src/modules/admin` folder.
   - Initialize `AdminModule`.

2. **Security & RBAC**
   - Implement `AdminGuard` using `Roles` decorator (e.g., `ROLE.ADMIN`).

3. **Admin APIs**
   - Implement `AdminController`:
     - `GET /admin/overview` (aggregate stats).
     - `GET /admin/incidents` (paginated list).
     - `POST /admin/incidents/:id/verify` (status update).

4. **Export Service**
   - Implement `ExportService`:
     - BullMQ job for CSV generation.
     - Integration with `CloudStorageService` for file uploads and signed URLs.

5. **Audit Logging**
   - Integrate `AuditLogInterceptor` or service to track all admin actions.

6. **Verification**
   - Verify role-based access (non-admins should get 403).
   - Test the async export flow.
