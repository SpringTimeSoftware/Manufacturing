# P068 Output

## Objective Status

- Bootstrapped the web workspace under `/src/web` with React + TypeScript + Vite.
- Kept the deployment model IIS-friendly by adding a host publish target that builds the web app and copies compiled assets into `STS.Mfg.Host/wwwroot`.
- Preserved the single ASP.NET Core host deployment unit instead of introducing a separate runtime server for the web app.

## Deliverables Completed

- Added web package, TypeScript, Vite, Vitest, favicon, and entry HTML scaffolding.
- Added the first app/provider bootstrap and global CSS token/base files.
- Added `/src/web/scripts/copy-to-host.mjs` and updated `STS.Mfg.Host.csproj` so `dotnet publish` runs the web build and prepares static assets for IIS.

## Files Created or Changed

- `/src/web/package.json`
- `/src/web/package-lock.json`
- `/src/web/tsconfig.json`
- `/src/web/tsconfig.app.json`
- `/src/web/tsconfig.node.json`
- `/src/web/vite.config.ts`
- `/src/web/vitest.config.ts`
- `/src/web/index.html`
- `/src/web/public/favicon.svg`
- `/src/web/scripts/copy-to-host.mjs`
- `/src/web/src/main.tsx`
- `/src/web/src/App.tsx`
- `/src/web/src/env.d.ts`
- `/src/web/src/styles/tokens.css`
- `/src/web/src/styles/base.css`
- `/src/web/src/styles/print.css`
- `/src/server/STS.Mfg.Host/STS.Mfg.Host.csproj`

## Assumptions Captured

- The production server still receives only the published ASP.NET Core output; Node tooling remains build-environment only.
- The web build output is generated and disposable; source-of-truth remains `/src/web`.

## Open Issues / Blockers

- No blocker for `P068`.
- `npm audit` reported moderate dependency vulnerabilities; no package upgrade was forced in this prompt because the foundation batch stayed focused on functional scaffolding.

## Build / Test / Lint

- `npm run build` passed.
- `npm test` passed with `2/2` frontend tests.
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln` passed.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release` passed and executed the web build/copy target.

## Next Prompt

- `/02-prompts/P069_web-shell-auth-flow-and-operating-context.md`
