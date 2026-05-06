# IIS Packaging

## Command

Run from the repository root:

```powershell
.\deploy\iis\publish-iis.ps1 -Configuration Release
```

## What The Script Does

1. Runs `npm ci` in `/src/web`.
2. Builds the React web app.
3. Copies compiled web assets into `/src/server/STS.Mfg.Host/wwwroot` through `npm run build:host`.
4. Builds the ASP.NET Core solution.
5. Publishes `STS.Mfg.Host` to an IIS-ready folder.
6. Fails if raw `src` or `node_modules` paths appear inside the publish output.

## Required Environment

- .NET SDK compatible with `net9.0`.
- Node.js and npm on the build machine only.
- SQL Server connection string supplied through ASP.NET Core configuration for the deployed app.
- Provider credentials supplied as secret references or environment-specific secure configuration.

## IIS Requirements

- IIS site root points at the published `STS.Mfg.Host` folder.
- ASP.NET Core Hosting Bundle installed.
- HTTPS binding configured.
- Static files served from `wwwroot`.
- API routes remain under `/api/*`.
- SPA fallback is handled by the ASP.NET Core host after publish.

## Health Checks

- Live: `/api/health/live`
- Ready: `/api/health/ready`

The ready endpoint must be checked after applying database scripts and before pilot traffic.
