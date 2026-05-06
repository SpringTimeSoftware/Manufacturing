# Run All Projects 2026-04-23 Wave 4B.1 Output

Date: 2026-04-23

## Runtime Status

- Backend: already running.
  - Process: `STS.Mfg.Host.exe`
  - URLs:
    - `https://localhost:7042`
    - `http://localhost:5102`
  - Health: `https://localhost:7042/api/health/ready` returned 200.
- Web: already running.
  - Process: Vite on Node.
  - URL: `http://127.0.0.1:5173`
  - Landing page returned 200.
  - Vite proxy health: `http://127.0.0.1:5173/api/health/ready` returned 200.
- Mobile Metro: already running.
  - Process: React Native Metro.
  - URL: `http://127.0.0.1:8081`
  - Metro status returned 200.

## Action Taken

- Verified the backend host project file exists.
- Verified web and mobile package manifests exist.
- Checked listening ports for backend, web, and Metro.
- Did not start duplicate processes because all expected services were already running.

## Testing URLs

- Web app: `http://127.0.0.1:5173`
- Backend API health: `https://localhost:7042/api/health/ready`
- Backend HTTP: `http://localhost:5102`
- Mobile Metro: `http://127.0.0.1:8081`
