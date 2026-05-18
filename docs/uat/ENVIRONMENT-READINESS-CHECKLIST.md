# Environment Readiness Checklist

Purpose: confirm the controlled internal UAT environment is deployable, recoverable, observable, and scoped before users begin role-wise UAT.

| Readiness item | Required | Owner | Evidence required | Expected result | Status |
| --- | --- | --- | --- | --- | --- |
| Git commit baseline | Required | Release owner | Commit SHA and branch | UAT build is tied to a pushed `main` commit | Pending |
| DB migration baseline | Required | DBA/Release owner | Applied migration/DDL list through `170_service_warranty_amc_completion.sql` | Database matches accepted foundation scope | Pending |
| IIS publish path | Required | Infrastructure | Publish folder path and timestamp | IIS points to publish output, not raw source | Pending |
| Backend health check | Required | Infrastructure | API health endpoint response | API returns healthy/200 | Pending |
| Web app health check | Required | Infrastructure | Browser screenshot/network result | Current static assets load without stale bundle | Pending |
| Mobile app health check | Required for mobile UAT | Mobile owner | Device launch screenshot | Mobile shell loads and authenticates | Pending |
| Auth/login roles | Required | Admin/Security | Role-wise login evidence | Admin, sales, procurement, warehouse, production, quality, dispatch, finance, service, mobile, report, integration, UDF users can sign in | Pending |
| Database backup | Required | DBA | Backup file path/timestamp/checksum | Backup completes before UAT starts | Pending |
| Restore drill | Required before production pilot | DBA/Infrastructure | Restored DB smoke report | Restore copy is readable and app can connect | Pending |
| Log folder/access | Required | Infrastructure | Log path and permission check | App can write logs and support can read them | Pending |
| API error logging | Required | Infrastructure | Forced validation error trace | User sees safe error; server log has traceable detail | Pending |
| Provider credentials configured | Required for live/sandbox send UAT | Integration owner | Credential references, not raw secrets | Providers block or send truthfully | Pending |
| Callback URLs reachable | Required for webhooks/provider receipts | Integration owner | Public URL health/signature test | Callbacks can be reached and verified | Pending |
| Device list registered | Required for mobile UAT | Mobile owner | Device registry export/screenshot | Trusted/revoked devices visible | Pending |
| Scanner/camera available | Required for mobile scan/photo UAT | Mobile owner | Device inventory and test photo/scan evidence | Hardware/runtime available or blocked with reason | Pending |
| Test users created | Required | Admin | User list and role matrix | UAT users mapped to scripts | Pending |
| Test master data loaded | Required | Business UAT lead | Master-data checklist signoff | UAT transactions can run without fake defaults | Pending |
| Rollback plan | Required | Release owner/DBA | Written rollback steps and owner contacts | Deployment can be rolled back safely | Pending |

## Current Baseline

- Latest accepted final audit commit before this readiness pack: `bffbce1`.
- Latest Pack 11 commit in history: `70561de`.
- Publish command to prepare server update: `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`.
- Default publish output: `src/server/STS.Mfg.Host/bin/Release/net9.0/publish/`.

## Pre-UAT Go / No-Go

Controlled internal UAT may start only when:
1. Git, DB, IIS, backend, web, auth, test users, and test master data are `Pass`.
2. Backup is complete.
3. Provider/device/runtime items required by the selected UAT scripts are `Pass` or explicitly marked as a boundary with a disabled-action reason.
4. The UAT blocker register has no open P0 blockers.

Production pilot remains blocked until:
1. Restore drill passes.
2. Live or approved sandbox provider verification passes.
3. Barcode/camera/offline runtime verification passes on real devices.
4. Role-wise UAT scripts are signed off by business owners.
5. P0/P1 blocker register is empty or accepted by steering decision.
