# Local Run Login Proxy Fix Output

Date: 2026-04-22

## Issue

Browser login through the Vite dev server showed `Unexpected API failure` and `/api/auth/login` returned HTTP 500.

## Root Cause

The web dev server proxies `/api` to `https://localhost:7042`, but the backend had been started on HTTP-only `http://localhost:5102`. The API itself was healthy: direct login to `http://localhost:5102/api/auth/login` succeeded.

## Runtime Fix

- Restarted the backend with both expected local URLs:
  - `https://localhost:7042`
  - `http://localhost:5102`
- Kept the existing Vite proxy configuration unchanged.

## Verification

- `http://127.0.0.1:5173/api/auth/login` with `platform.admin` / `Platform@123`: PASS
- `http://127.0.0.1:5173/api/auth/login` with `super.admin` / `Super@123`: PASS
- `https://localhost:7042/api/health/ready`: PASS

## Running Projects

- Backend: listening on `https://localhost:7042` and `http://localhost:5102`
- Web: listening on `http://127.0.0.1:5173`
- Mobile Metro: listening on `http://127.0.0.1:8081`
