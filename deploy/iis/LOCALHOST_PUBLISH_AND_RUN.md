# Localhost Publish And Run

## Purpose

This runbook verifies the IIS publish-folder artifact locally by running the published ASP.NET Core host directly on `localhost`. It preserves the deployment model: React web assets are served from the ASP.NET Core host `wwwroot`, not from raw web source.

## Verified Local URL

- URL: `http://127.0.0.1:5088`
- Publish folder: `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish`
- Executable: `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish\STS.Mfg.Host.exe`

## Prerequisites

- .NET SDK/runtime compatible with `net9.0`.
- Node.js and npm available on the build machine.
- SQL Server database scripts already applied to `Manufacturing_ERP` on `120.138.10.194`.
- SQL credentials supplied as environment variables or by an equivalent local secret mechanism. Do not commit credentials.

## Build And Publish

From `C:\StsPackages\Manufacturing_ERP`:

```powershell
dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln
dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release
.\deploy\iis\publish-iis.ps1 -Configuration Release
```

The publish script writes the IIS-ready folder to:

```text
C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish
```

## Local Runtime Environment

Set these values in the PowerShell session that starts the host:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Production"
$env:ASPNETCORE_URLS = "http://127.0.0.1:5088"
$env:ConnectionStrings__SqlServer = "Server=120.138.10.194;Database=Manufacturing_ERP;User Id=<sql-user>;Password=<sql-password>;TrustServerCertificate=True"
$env:Storage__AttachmentsRoot = "C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish\App_Data\attachments"
```

Create the local attachment folder if needed:

```powershell
New-Item -ItemType Directory -Force -Path "C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish\App_Data\attachments"
```

## Start The Published Host

```powershell
cd C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish
.\STS.Mfg.Host.exe
```

For background execution with logs:

```powershell
$publishDir = "C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish"
$stdout = "C:\StsPackages\Manufacturing_ERP\artifacts\localhost-publish-stdout.log"
$stderr = "C:\StsPackages\Manufacturing_ERP\artifacts\localhost-publish-stderr.log"
Start-Process -FilePath "$publishDir\STS.Mfg.Host.exe" -WorkingDirectory $publishDir -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
```

## Verification

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:5088/ -UseBasicParsing
Invoke-RestMethod -Uri http://127.0.0.1:5088/api/health/live
Invoke-RestMethod -Uri http://127.0.0.1:5088/api/health/ready
```

Expected results:

- Root page returns HTTP `200` and title `STS Manufacturing ERP`.
- `/api/health/live` returns `Healthy`.
- `/api/health/ready` returns `Healthy` when SQL Server and attachment storage are available.
- Logs show `Application started` and no startup exception.

In an HTTP-only localhost run, this warning is acceptable:

```text
Failed to determine the https port for redirect.
```

It means no HTTPS port was configured for the local direct host run; it does not block root-page or health-check verification.

## Stop The Local Process

```powershell
Get-Process STS.Mfg.Host | Stop-Process
```

## Result From 2026-04-21 Verification

- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: passed.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: passed.
- `.\deploy\iis\publish-iis.ps1 -Configuration Release`: passed.
- Published host started from `artifacts\iis-publish`.
- Root page returned HTTP `200`, content type `text/html`, title `STS Manufacturing ERP`.
- `/api/health/live`: `Healthy`.
- `/api/health/ready`: `Healthy`.
