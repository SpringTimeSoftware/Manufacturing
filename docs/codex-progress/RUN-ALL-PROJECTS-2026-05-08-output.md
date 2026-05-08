# Run All Projects Output

Date: 2026-05-08

## Scope

- Started the local runnable projects after the user request to run all projects.
- No source, database, seed, or configuration changes were made.

## Running Services

| Project | URL | Process | PID | Result |
| --- | --- | --- | --- | --- |
| Backend host | `https://localhost:7042` | `STS.Mfg.Host` | `51000` | Running; liveness passed, readiness degraded |
| Web app | `http://127.0.0.1:5173` | `node` | `54164` | Running |
| Mobile Metro | `http://127.0.0.1:8081` | `node` | `38152` | Running |

## Smoke Checks

- Backend liveness: `https://localhost:7042/api/health/live` returned HTTP 200.
- Backend readiness: `https://localhost:7042/api/health/ready` returned HTTP 503.
- Backend readiness details: SQL Server is reported as not configured; attachment storage is unavailable; background jobs and integration placeholders are healthy.
- Web dev server: `http://127.0.0.1:5173` returned HTTP 200.
- Mobile Metro status: `http://127.0.0.1:8081/status` returned `packager-status:running`.

## Logs

- Backend: `artifacts/run-logs/backend-host.log`
- Web: `artifacts/run-logs/web-vite.log`
- Mobile Metro: `artifacts/run-logs/mobile-metro.log`

## Notes

- Web and mobile are ready for local UI testing.
- Backend process is running and serving liveness, but the readiness gate is not clean until SQL Server configuration and attachment storage are available for this local runtime.
