# WS02 Platform / Security / Admin / Extensibility Output

Date: 2026-05-13

## Status

COMPLETE for the WS02 implementation slice. Critical touched-scope blockers are 0. Visible touched actions are working, disabled with reason, or hidden. UDF foundation is implemented as an additive platform capability; embedding UDF value panels into every downstream business workspace remains outside this workstream.

## Files Changed

- Backend/API: platform runtime contracts, service methods, platform controllers, localization resource upsert endpoint.
- Database: `database/ddl/00-foundation/004_platform_extensibility_tables.sql`, platform seed proof, database README execution order.
- Web: platform API client contracts, platform admin adapters, `/platform/extensibility` route/page/tests, navigation and help content.
- Governance/docs: WS02 workstream matrices, action/field/issue matrices, help registries, screenshot evidence.
- Tests: UDF page test, UDF platform contract test, rate-limit path coverage, forgot-password API-backed test adjustment.

## Screens Completed

- Users
- Roles & Permissions
- Audit Trail
- Notifications
- Approvals
- Attachments
- Language Setup
- Workflow & Numbering
- Tenant Settings
- Platform Settings
- Extensibility / UDF

## Fields Corrected

- UDF entity type, data type, control type, lookup source, role visibility use governed selectors.
- UDF maximum length and decimal scale use numeric controls.
- UDF minimum and maximum numeric values use decimal controls.
- UDF validation metadata is persisted through the platform API and documented in the field matrices.

## Actions Wired / Disabled / Hidden

- Wired: UDF New field, UDF Save definition, UDF list/filter/search.
- Wired backend APIs: user access policy update, user reset request, permission catalog, role create/update/clone, workflow rule create/update, tenant setting update, translation resource upsert, approval detail/history, UDF definition/value list and upsert.
- Disabled with reason: external identity invite/reset delivery, role governance UI create/clone actions, workflow/tenant policy UI saves where approval workflow remains the business gate, UDF bulk import until approved import mapping exists.
- No visible touched action remains handlerless and enabled.

## Backend / DB Changes

- Added UDF definitions and values tables under `platform`.
- Added UDF seed definitions for Item, Customer, and WorkOrder proof data.
- Added platform contract DTOs and write APIs with validation and audit writes.
- Added role clone permission copy behavior.
- Added UDF definition role-visibility filtering for non-deployment access.

## UAT Scenarios

- PASS: Super Admin route discovery includes `/platform/extensibility`.
- PASS: UDF list renders searchable/filterable definitions.
- PASS: UDF New field opens centered modal workspace.
- PASS: UDF Save definition is disabled until required metadata validates, then saves through the adapter/API path.
- PASS: Live forgot-password UI no longer fabricates success on API failure.
- PASS: Live notification/approval fallback behavior remains governed by existing tests.
- NOT-IN-SCOPE: external identity delivery, authenticator/SMS delivery, mobile device trust, and global UDF value panels on every domain workspace.

## Validation Results

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 41 files / 169 tests
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 35 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence

Folder: `docs/codex-review-screens/WS02/`

Captured users, roles, audit, notifications, approvals, attachments, translations, workflow/numbering, tenant settings, platform settings, extensibility, and representative modal workspaces.

## Remaining Blockers

- External identity invitation and reset delivery remain disabled with reason because email/SMS/authenticator delivery is not completed in this repo.
- Bulk UDF import remains disabled with reason until approved import mapping exists.
- UDF value panels on every downstream domain screen remain a later workstream after this foundation.

## Review Pack

`artifacts/review-packs/WS02-review-pack.zip`
