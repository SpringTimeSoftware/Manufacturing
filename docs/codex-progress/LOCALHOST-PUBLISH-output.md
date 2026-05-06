# LOCALHOST-PUBLISH Output

## Scope Completed

- Published the current STS Manufacturing ERP application locally in Release mode.
- Verified the IIS publish-folder artifact using the published ASP.NET Core host.
- Did not execute any P-series prompt, add product scope, or change runtime behavior.

## Build And Publish Results

- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: passed.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: passed.
- `.\deploy\iis\publish-iis.ps1 -Configuration Release`: passed.
- React web `build:host` ran as part of publish and refreshed the ASP.NET Core host `wwwroot`.
- Existing non-failing notices remain: Vite single-bundle chunk-size warning and npm audit output with 5 moderate vulnerabilities.

## Local Run Configuration

- Publish folder: `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish`
- Executable: `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish\STS.Mfg.Host.exe`
- URL: `http://127.0.0.1:5088`
- Environment: `Production`
- SQL connection: supplied through process environment to `Manufacturing_ERP` on `120.138.10.194`; no credential file was written.
- Attachment root: `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish\App_Data\attachments`

## Verification Results

- Published host process started successfully.
- Root page `http://127.0.0.1:5088/`: HTTP `200`, content type `text/html`, title `STS Manufacturing ERP`.
- `/api/health/live`: `Healthy`.
- `/api/health/ready`: `Healthy`.
- Startup logs show `Application started` and listening on `http://127.0.0.1:5088`.
- No startup exception appeared in stdout or stderr.
- One expected HTTP-only local warning appeared: `Failed to determine the https port for redirect.`

## Files Created Or Changed

- `/deploy/iis/LOCALHOST_PUBLISH_AND_RUN.md`
- `/docs/codex-progress/LOCALHOST-PUBLISH-output.md`
- Publish artifacts refreshed under `/artifacts/iis-publish/`
- Local verification logs written under `/artifacts/localhost-publish-stdout.log` and `/artifacts/localhost-publish-stderr.log`

## Manual Rerun Commands

```powershell
cd C:\StsPackages\Manufacturing_ERP
dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln
dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release
.\deploy\iis\publish-iis.ps1 -Configuration Release

$env:ASPNETCORE_ENVIRONMENT = "Production"
$env:ASPNETCORE_URLS = "http://127.0.0.1:5088"
$env:ConnectionStrings__SqlServer = "Server=120.138.10.194;Database=Manufacturing_ERP;User Id=<sql-user>;Password=<sql-password>;TrustServerCertificate=True"
$env:Storage__AttachmentsRoot = "C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish\App_Data\attachments"
New-Item -ItemType Directory -Force -Path $env:Storage__AttachmentsRoot

cd C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish
.\STS.Mfg.Host.exe
```

## Next Recommended Step

- Run a browser smoke test against `http://127.0.0.1:5088`, then verify login/context-switch and the SQL-backed admin/platform screens using the `Manufacturing_ERP` database.
