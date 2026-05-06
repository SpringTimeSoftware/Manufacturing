# RUN-PROJECTS-LOCAL Output

## Scope Completed

- Started the web Vite dev server at `http://127.0.0.1:5173/`.
- Started the ASP.NET Core host with development settings at `https://localhost:7042` and `http://localhost:5102`.
- Kept the web source proxy unchanged; the backend now listens on the proxy target expected by Vite.
- Created the local development database `STS_Mfg_Dev` in `(localdb)\MSSQLLocalDB` and applied the existing ordered minimum DDL and seed packs.

## Runtime Fix

- Fixed backend startup by changing `ScopeAuthorizationHandler` from singleton to scoped registration so it can safely consume scoped `IDataScopeService`.
- No role, policy, database schema, or auth behavior change was introduced beyond the service lifetime needed for host startup.

## Verification

- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: passed.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: passed, 12 tests.
- `http://localhost:5102/api/health/ready`: healthy.
- `http://127.0.0.1:5173/api/health/ready`: healthy through the Vite proxy.
- Login smoke through the Vite proxy passed for `platform.admin` with active context `ACME / ACME-N`.

## Running Processes

- Web dev server: Node/Vite process listening on `127.0.0.1:5173`.
- Backend host: `STS.Mfg.Host.exe` listening on `localhost:7042` and `localhost:5102`.

## Notes

- Mobile startup was completed afterward in `RUN-MOBILE-LOCAL`; Metro now runs at `http://127.0.0.1:8081`.
- Runtime logs are written under `.codex-run-logs/`.

## Rerun - 2026-04-22 15:16 IST

- Web dev server is running at `http://127.0.0.1:5173/` with Node/Vite process `41968`.
- ASP.NET Core host is running with Development settings on `https://localhost:7042` and `http://localhost:5102` with host process `40944`.
- Verified `http://localhost:5102/api/health/ready`: `200 OK`.
- Verified `https://localhost:7042/api/health/ready`: `200 OK`.
- Verified `http://127.0.0.1:5173/api/health/ready`: `200 OK` through the Vite proxy.
- Verified `http://127.0.0.1:5173/`: `200 OK`.
- Restarted the backend after an initial HTTP-only launch because the web proxy targets `https://localhost:7042`.
