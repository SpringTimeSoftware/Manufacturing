# Production Security Hardening Review

## Scope

Prompt P146 reviewed auth, authorization, attachment access, secret handling, provider configuration, rate limiting, and audit completeness against `/docs/security/audit-strategy.md` and `/docs/security/role-matrix.md`.

## Controls Already Present

| Area | Status | Notes |
| --- | --- | --- |
| Authentication | Present | JWT bearer auth is wired through the ASP.NET Core host and bootstrap auth service. |
| Authorization | Present | API controllers use role policies such as platform administration, company administration, and branch operations. |
| Data scoping | Present | Application services use current user context and company/branch/warehouse scope checks. |
| Audit trail | Present | Major application services call the shared audit trail for create/update/state actions. |
| Attachments | Present | Attachment metadata and storage abstraction exist; binary content is not logged. |
| Secret handling | Partial | Provider credentials use credential references and configuration; no vendor secrets are hard-coded in P138-P142 code. |
| AI safety | Present | AI execution is draft-only, masks common PII, maps assistant intents to approved stored procedures, and blocks arbitrary SQL. |
| Health checks | Present | Live and ready health endpoints are exposed under `/api/health/*`. |

## Production Gaps To Close Before Pilot

| Gap | Risk | Required Action |
| --- | --- | --- |
| Rate limiting policy | Login, AI, import/export, and integration endpoints can be overused by clients. | Add endpoint-specific ASP.NET Core rate limiting with safe API-envelope rejection. |
| Attachment authorization | Metadata/storage abstraction exists, but every download path must prove document-scope access. | Add authorization tests around attachment download and preview endpoints. |
| Secret rotation | Credential references avoid hard-coded secrets, but rotation procedure is not scripted. | Document Key Vault/Windows secret-store rotation and provider disable process. |
| Audit read model | Audit write path exists; production audit viewer access needs least-privilege verification. | Add audit viewer API tests for PlatformAdmin/CompanyAdmin/PlantHead boundaries. |
| Provider outbound delivery | Email/Sms/WhatsApp adapters are vendor-neutral placeholders. | Bind real providers through environment configuration and run redacted delivery tests. |
| Mobile device trust | Device binding is represented, but production revocation policy is not complete. | Add device revoke and lost-device procedures before pilot. |

## Security Review Decision

- No destructive schema or scope changes were made.
- No HR, payroll, accounting, or unrelated modules were introduced.
- P146 is complete as a hardening review artifact with explicit follow-up backlog rather than silent TODOs.
