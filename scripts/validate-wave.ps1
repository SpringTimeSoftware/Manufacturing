param(
    [string]$RepoRoot,
    [string]$WaveConfigPath
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "wave-common.ps1")

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = Get-RepoRoot -ScriptRoot $PSScriptRoot
}

$config = Get-WaveConfig -RepoRoot $RepoRoot -WaveConfigPath $WaveConfigPath
$waveId = [string]$config["wave_id"]
$logRoot = Ensure-Directory -Path (Join-Path $RepoRoot "artifacts\wave-logs\$waveId")

try {
    if ($config["requires_backend_validation"]) {
        Stop-RepoBackendProcesses
        Start-Sleep -Seconds 2
    }

    Invoke-LoggedCommand -Label "web-typecheck" -Command "npm.cmd run typecheck" -WorkingDirectory (Join-Path $RepoRoot "src\web") -LogFile (Join-Path $logRoot "web-typecheck.log")
    Invoke-LoggedCommand -Label "web-test" -Command "npm.cmd test" -WorkingDirectory (Join-Path $RepoRoot "src\web") -LogFile (Join-Path $logRoot "web-test.log")
    Invoke-LoggedCommand -Label "web-build" -Command "npm.cmd run build" -WorkingDirectory (Join-Path $RepoRoot "src\web") -LogFile (Join-Path $logRoot "web-build.log")
    Invoke-LoggedCommand -Label "web-build-host" -Command "npm.cmd run build:host" -WorkingDirectory (Join-Path $RepoRoot "src\web") -LogFile (Join-Path $logRoot "web-build-host.log")

    if ($config["requires_backend_validation"]) {
        Invoke-LoggedCommand -Label "backend-build" -Command "dotnet build `"$RepoRoot\src\server\STS.Mfg.sln`"" -WorkingDirectory $RepoRoot -LogFile (Join-Path $logRoot "backend-build.log")
        Invoke-LoggedCommand -Label "backend-test" -Command "dotnet test `"$RepoRoot\src\server\STS.Mfg.sln`" --no-build" -WorkingDirectory $RepoRoot -LogFile (Join-Path $logRoot "backend-test.log")
        Invoke-LoggedCommand -Label "backend-publish" -Command "dotnet publish `"$RepoRoot\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj`" -c Release" -WorkingDirectory $RepoRoot -LogFile (Join-Path $logRoot "backend-publish.log")
    }

    if ($config.ContainsKey("requires_mobile_validation") -and $config["requires_mobile_validation"]) {
        $mobilePackageJson = Join-Path $RepoRoot "src\mobile\package.json"
        $mobileScripts = Get-PackageScripts -PackageJsonPath $mobilePackageJson
        if ($mobileScripts.ContainsKey("typecheck")) {
            Invoke-LoggedCommand -Label "mobile-typecheck" -Command "npm.cmd run typecheck" -WorkingDirectory (Join-Path $RepoRoot "src\mobile") -LogFile (Join-Path $logRoot "mobile-typecheck.log")
        } else {
            throw "Current wave requires mobile validation but src/mobile/package.json does not expose a typecheck script."
        }
    }

    if ($config["requires_db_validation"]) {
        $dbArtifacts = @($config["expected_outputs"]["db_artifacts"])
        if ($dbArtifacts.Count -eq 0) {
            throw "Current wave requires DB validation but CURRENT_WAVE.yaml does not list expected DB artifacts."
        }

        foreach ($artifact in $dbArtifacts) {
            $resolved = Resolve-RepoPath -RepoRoot $RepoRoot -Path $artifact
            if (-not (Test-Path $resolved)) {
                throw "Declared DB artifact is missing: $resolved"
            }
        }
    }

    Write-Host "WAVE VALIDATION: PASS"
    exit 0
} catch {
    Write-Host "WAVE VALIDATION: FAIL - $($_.Exception.Message)"
    exit 1
}
