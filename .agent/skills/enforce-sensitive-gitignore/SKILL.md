---
name: Enforce Sensitive Gitignore
description: Ensure that sensitive files and secrets are never committed by enforcing comprehensive .gitignore rules.
---

# Enforce Sensitive Gitignore

When working on any project, you MUST guarantee that no sensitive data (keys, credentials, environment variables, keystores, etc.) is accidentally committed.

## Guidelines
1. **Always Check the Root `.gitignore`:** Ensure it contains comprehensive patterns for sensitive files.
2. **Key Patterns to Include:**
   - `.env` and `.env.*` (while allowing `!.env.example` or similar templates)
   - Certificate and key files: `*.pem`, `*.key`, `*.keystore`, `*.jks`, `*.p12`, `*.pkcs12`, `*.pfx`
   - Cloud credential files: `*credentials*.json`, `service-account*.json`, `*secrets*.json`, `google-services.json`, `GoogleService-Info.plist`
3. **No Local Gitignores:** Enforce that all top-level ignores for a project are kept at the *root* `.gitignore` rather than scattered in subdirectories.
4. **Action:** If you are asked to secure a project, check for sensitive files, or create a project, make sure to add these rules to the root `.gitignore`.

If you write or generate any sensitive keys during your tasks, double check that `.gitignore` covers them.
