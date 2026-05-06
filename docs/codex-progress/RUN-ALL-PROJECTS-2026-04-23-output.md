# Run All Projects Output

Date: 2026-04-23

## Scope

- Verified all local runnable projects after the user request to run all projects.
- No code, backend, database, seed, or configuration changes were made.

## Running Services

| Project | URL | Process | PID | Result |
| --- | --- | --- | --- | --- |
| Backend host | `https://localhost:7042` and `http://localhost:5102` | `STS.Mfg.Host` | `31684` | Running |
| Web app | `http://127.0.0.1:5173` | `node` | `21264` | Running |
| Mobile Metro | `http://127.0.0.1:8081` | `node` | `49460` | Running |

## Smoke Checks

- Backend health check: `https://localhost:7042/health` returned HTTP 200.
- Web dev server: `http://127.0.0.1:5173` returned HTTP 200.
- Mobile Metro status: `http://127.0.0.1:8081/status` returned `packager-status:running`.

## Notes

- Existing processes were already running, so no restart was required.
- The app is ready for local browser/mobile testing from the URLs above.
