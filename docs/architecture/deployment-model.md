# Deployment Model

## Objective

The deployment model must guarantee that customer IIS servers receive only compiled and published artifacts. Raw React web source, build tooling, and development-only files do not belong on the live server.

## Deployment Principles

- Use a single publishable ASP.NET Core host as the production deployment unit.
- Build the React web app into static assets before server publish.
- Copy the compiled web output into `STS.Mfg.Host/wwwroot` during publish.
- Serve the SPA and API from the same IIS-hosted ASP.NET Core application.
- Keep mobile artifacts separate from IIS deployment.
- Treat SQL migrations and seed scripts as deployment-side assets, not part of the live web root.

## Build Chain Overview

```text
src/web source
  -> web production build
  -> static assets output
  -> copied into src/server/STS.Mfg.Host/wwwroot

src/server projects
  -> dotnet publish STS.Mfg.Host
  -> IIS-ready publish folder
  -> deploy to IIS server

src/mobile source
  -> platform-specific app builds
  -> APK / AAB / IPA artifacts
  -> distributed outside IIS
```

## Source and Output Paths

| Path | Role |
| --- | --- |
| `/src/web` | React + TypeScript source |
| `/src/web/public` | Static public assets used during web build |
| `/src/server/STS.Mfg.Host/wwwroot` | Final static asset destination inside the ASP.NET host |
| `/deploy/iis` | IIS packaging and deployment scripts |
| `/deploy/mobile` | Mobile packaging and release notes |
| `/database/migrations` | Schema change scripts applied during deployment workflow |
| `/database/seeds` | Demo/bootstrap seed scripts |

## Web Build Contract

- The web app builds in production mode to fingerprinted static assets such as JavaScript bundles, CSS bundles, icons, fonts, and manifest files.
- The web build output is disposable and reproducible. It is never edited by hand.
- The web source of truth remains `/src/web`, not `wwwroot`.
- Environment-specific values for the web app should come from build-time environment files or host-served configuration endpoints, not hand-editing built files on the server.

## Host Publish Contract

- `STS.Mfg.Host` is the only project published for IIS deployment.
- The publish pipeline must run the web production build first.
- The publish pipeline copies the built web output into `STS.Mfg.Host/wwwroot`.
- `dotnet publish` then produces the IIS-ready folder containing:
  - compiled ASP.NET assemblies
  - host configuration
  - static web assets in `wwwroot`
  - runtime-specific publish output if self-contained publish is later chosen
- No `src/web`, `node_modules`, TypeScript source, or raw prompt-pack files are required on the production server.

## Recommended Publish Flow

1. Restore backend and web dependencies in CI or build environment.
2. Build the web app in production mode.
3. Copy web build output into `src/server/STS.Mfg.Host/wwwroot`.
4. Run `dotnet publish` for `STS.Mfg.Host`.
5. Package the publish folder as the IIS deployment artifact.
6. Deploy only the packaged publish folder to the target IIS site.

## IIS Hosting Model

- IIS hosts the ASP.NET Core application through the ASP.NET Core Module.
- The site root points to the published `STS.Mfg.Host` output folder.
- API routes remain under `/api/*`.
- Static web assets are served from `wwwroot`.
- SPA fallback routes return `index.html` for client-side routes that are not API, file, or health endpoints.
- Uploaded files and attachment storage must be stored outside the deployed application folder or in an approved managed storage provider.

## SPA Fallback Rules

- Requests to `/api/*` always route to server endpoints.
- Requests for known static files such as `.js`, `.css`, `.png`, `.svg`, and fonts are served directly.
- Unknown browser routes such as `/work-orders`, `/job-cards/JC-1023`, or `/dashboard/stage-wise` fall back to the SPA entry page.
- Health and diagnostics routes stay server-owned and must not be shadowed by SPA routing.

## Environment Configuration

- Server environment configuration lives in ASP.NET Core configuration sources such as `appsettings.json`, `appsettings.{Environment}.json`, environment variables, and secure secret stores.
- The production server must not require Node, npm, or TypeScript tooling.
- Connection strings, provider secrets, and integration credentials stay in server configuration, not inside the web source tree.
- Web runtime configuration that must vary by environment should come from server-hosted bootstrap configuration or environment-specific web build inputs.

## Deployment Outputs

### IIS publish output

- ASP.NET Core host binaries
- web static assets in `wwwroot`
- IIS-compatible configuration files
- deployment scripts or package metadata when needed

### Mobile release output

- Android APK or AAB
- iOS IPA or archive output
- release notes and distribution metadata

## Mobile Separation Rules

- Mobile builds are produced independently from IIS publish.
- Mobile artifacts are not copied into the web host.
- Mobile app configuration should target the deployed API base URL and approved auth endpoints.
- Offline queue and device asset packaging remain mobile concerns, not IIS concerns.

## CI/CD Expectations

- CI should run web build and server publish as separate but linked stages.
- Deployment automation must validate that the web build was copied into `wwwroot` before packaging the host output.
- Future pipeline scripts should fail if raw web source is being included in the IIS package.

## Proof That Raw React Source Is Not Required On IIS

- The only web files needed at runtime are compiled static assets under `wwwroot`.
- The ASP.NET Core host serves those assets directly after publish.
- Client-side routing is handled by the SPA fallback in the host configuration.
- Therefore the production server does not need `/src/web`, TypeScript source, or frontend build tooling.
