# SESSION-RESTORE-FIX Output

Date: 2026-05-08
Branch: main

## Issue

Refreshing an authenticated ERP page could return the user to `/login` even when a browser session existed in local storage.

## Root Cause

`AuthProvider.restoreSession` cleared the stored session on any `/api/auth/me` restore failure that was not exactly HTTP 401. A transient API/server/proxy failure during reload therefore converted a valid stored session into logout. The restore effect could also be retriggered after restore state changed.

## Fix

- Added access-token freshness checking before restore fallback decisions.
- Restores a still-current stored browser session immediately while live profile verification runs.
- Clears local storage only for confirmed authentication failure, such as invalid refresh token.
- Keeps a current stored session on transient profile/refresh verification failures and exposes a restore warning.
- Added a one-shot restore guard so session restore runs once per provider mount.
- Added regression coverage for current stored sessions surviving transient `/api/auth/me` failure.
- Rebuilt and copied the frontend bundle into the ASP.NET host webroot.

## Validation

- `npm test -- AuthContext.test.tsx` - PASS, 4 tests
- `npm run typecheck` - PASS
- `npm run build` - PASS, with existing Vite large chunk warning
- `npm run build:host` - PASS
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` - PASS, publish folder refreshed with fixed frontend bundle
