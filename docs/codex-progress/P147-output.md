# P147 - IIS Packaging And Deployment Scripts

## Scope Completed

- Added an IIS publish script that builds the React web app, copies host assets, builds the server solution, and publishes a single IIS-ready folder.
- Added deployment documentation for environment variables, IIS static/rewrite requirements, health checks, execution order, and forbidden raw-source paths.
- Preserved the IIS publish-folder deployment model; no raw web source is required on the live server.

## Files Changed

- `/deploy/iis/publish-iis.ps1`
- `/deploy/iis/README.md`
- `/docs/codex-progress/README.md`

## Validation

- `npm run build:host`: passed and copied web assets into the host `wwwroot`.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: passed and invoked the host web build pipeline.
- The new deployment script was reviewed but not separately executed because the required publish gate already exercised the same build/publish path.

## Risks And Follow-Ups

- Operators must still provide production environment variables and IIS binding/rewrite configuration outside the repo.

## Next Prompt

- `/02-prompts/P148_uat-scripts-demo-data-refresh-and-acceptance-matrix.md`
