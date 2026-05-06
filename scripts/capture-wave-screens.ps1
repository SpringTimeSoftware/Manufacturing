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
$resolvedWaveConfigPath = Get-WaveConfigPath -RepoRoot $RepoRoot -WaveConfigPath $WaveConfigPath
$waveId = [string]$config["wave_id"]
$captureRoot = New-CleanDirectory -Path (Join-Path $RepoRoot "docs\codex-review-screens\$waveId")
$runtimeLogRoot = Ensure-Directory -Path (Join-Path $captureRoot "runtime-logs")

Ensure-WaveAutomationDependencies -RepoRoot $RepoRoot

try {
    if (-not (Test-PortListening -Port 5102) -or -not (Test-PortListening -Port 7042)) {
        $backend = Start-LoggedProcess `
            -WorkingDirectory $RepoRoot `
            -Command "dotnet run --project '$RepoRoot\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj' --urls 'https://127.0.0.1:7042;http://127.0.0.1:5102'" `
            -StdOutLog (Join-Path $runtimeLogRoot "backend.out.log") `
            -StdErrLog (Join-Path $runtimeLogRoot "backend.err.log")
        Wait-ForPort -Port 5102 -Label "Backend HTTP"
        Wait-ForPort -Port 7042 -Label "Backend HTTPS"
    }

    if (-not (Test-PortListening -Port 5173)) {
        $web = Start-LoggedProcess `
            -WorkingDirectory (Join-Path $RepoRoot "src\web") `
            -Command "npm.cmd run dev -- --host 127.0.0.1" `
            -StdOutLog (Join-Path $runtimeLogRoot "web.out.log") `
            -StdErrLog (Join-Path $runtimeLogRoot "web.err.log")
        Wait-ForPort -Port 5173 -Label "Web dev server"
    }

    if ($config.ContainsKey("requires_mobile_validation") -and $config["requires_mobile_validation"] -and -not (Test-PortListening -Port 8081)) {
        $mobileScripts = Get-PackageScripts -PackageJsonPath (Join-Path $RepoRoot "src\mobile\package.json")
        if ($mobileScripts.ContainsKey("dev")) {
            $mobile = Start-LoggedProcess `
                -WorkingDirectory (Join-Path $RepoRoot "src\mobile") `
                -Command "npm.cmd run dev" `
                -StdOutLog (Join-Path $runtimeLogRoot "mobile.out.log") `
                -StdErrLog (Join-Path $runtimeLogRoot "mobile.err.log")
            Wait-ForPort -Port 8081 -Label "Metro"
        }
    }

    $helperScript = Join-Path $RepoRoot "scripts\wave-automation\capture-wave-screens.mjs"
    $captureLog = Join-Path $runtimeLogRoot "capture.log"
    Invoke-LoggedCommand `
        -Label "wave-screen-capture" `
        -Command "node `"$helperScript`" `"$resolvedWaveConfigPath`" `"$captureRoot`"" `
        -WorkingDirectory (Join-Path $RepoRoot "scripts\wave-automation") `
        -LogFile $captureLog

    $pngFiles = @(Get-ChildItem -Path $captureRoot -Filter *.png -File -ErrorAction SilentlyContinue)
    if ($pngFiles.Count -eq 0) {
        throw "No screenshots were created under $captureRoot."
    }

    Write-Host "WAVE SCREEN CAPTURE: PASS"
    exit 0
} catch {
    Write-Host "WAVE SCREEN CAPTURE: FAIL - $($_.Exception.Message)"
    exit 1
}
