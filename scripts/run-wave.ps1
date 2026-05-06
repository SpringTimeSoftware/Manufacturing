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
$waveName = [string]$config["wave_name"]
$automationOutputPath = Join-Path $RepoRoot "docs\codex-progress\$waveId-AUTOMATION-output.md"
$reviewPackPath = Join-Path $RepoRoot "artifacts\review-packs\$waveId-review-pack.zip"
$status = "FAIL"
$notes = New-Object System.Collections.Generic.List[string]

try {
    & (Join-Path $PSScriptRoot "validate-wave.ps1") -RepoRoot $RepoRoot -WaveConfigPath $WaveConfigPath
    if ($LASTEXITCODE -ne 0) {
        throw "Validation gate failed."
    }
    $notes.Add("Validation gate passed.")

    & (Join-Path $PSScriptRoot "capture-wave-screens.ps1") -RepoRoot $RepoRoot -WaveConfigPath $WaveConfigPath
    if ($LASTEXITCODE -ne 0) {
        throw "Screenshot evidence gate failed."
    }
    $notes.Add("Screenshot evidence gate passed.")

    & (Join-Path $PSScriptRoot "build-review-pack.ps1") -RepoRoot $RepoRoot -WaveConfigPath $WaveConfigPath
    if ($LASTEXITCODE -ne 0) {
        throw "Review-pack assembly failed."
    }
    $notes.Add("Review-pack assembly passed.")

    if (-not (Test-Path $reviewPackPath)) {
        throw "Review pack was not created: $reviewPackPath"
    }

    $screenshotCount = @(Get-ChildItem -Path (Join-Path $RepoRoot "docs\codex-review-screens\$waveId") -Filter *.png -File -ErrorAction SilentlyContinue).Count
    $status = "PASS"

    $lines = @(
        "# $waveId Automation Output",
        "",
        "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "",
        "- Wave: $waveName",
        "- Status: $status",
        "- Screenshots: $screenshotCount",
        "- Review pack: $reviewPackPath",
        "- Stop after completion: $($config["stop_after_completion"])",
        ""
    ) + ($notes | ForEach-Object { "- $_" })

    Set-Content -Path $automationOutputPath -Value $lines
    Write-Host "RUN WAVE: PASS"
    exit 0
} catch {
    $notes.Add($_.Exception.Message)
    $lines = @(
        "# $waveId Automation Output",
        "",
        "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "",
        "- Wave: $waveName",
        "- Status: FAIL",
        ""
    ) + ($notes | ForEach-Object { "- $_" })

    Set-Content -Path $automationOutputPath -Value $lines
    Write-Host "RUN WAVE: FAIL - $($_.Exception.Message)"
    exit 1
}
