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
$reviewPackRoot = Ensure-Directory -Path (Join-Path $RepoRoot "artifacts\review-packs")
$stageRoot = New-CleanDirectory -Path (Join-Path $reviewPackRoot $waveId)
$zipPath = Join-Path $reviewPackRoot "$waveId-review-pack.zip"

try {
    $requiredFiles = New-Object System.Collections.Generic.List[string]
    $requiredFiles.Add((Resolve-RepoPath -RepoRoot $RepoRoot -Path $config["expected_outputs"]["wave_output_markdown"]))
    $requiredFiles.Add((Resolve-RepoPath -RepoRoot $RepoRoot -Path "/07-ux-governance/action_truth_matrix.csv"))

    foreach ($matrix in @($config["expected_outputs"]["governance_matrices"])) {
        $resolved = Resolve-RepoPath -RepoRoot $RepoRoot -Path $matrix
        if (-not $requiredFiles.Contains($resolved)) {
            $requiredFiles.Add($resolved)
        }
    }

    foreach ($artifact in @($config["expected_outputs"]["db_artifacts"])) {
        $requiredFiles.Add((Resolve-RepoPath -RepoRoot $RepoRoot -Path $artifact))
    }

    foreach ($artifact in @($config["expected_outputs"]["seed_artifacts"])) {
        $requiredFiles.Add((Resolve-RepoPath -RepoRoot $RepoRoot -Path $artifact))
    }

    foreach ($file in $requiredFiles) {
        Copy-ToStage -RepoRoot $RepoRoot -StageRoot $stageRoot -SourcePath $file
    }

    $screenshotFolder = Join-Path $RepoRoot "docs\codex-review-screens\$waveId"
    Copy-ToStage -RepoRoot $RepoRoot -StageRoot $stageRoot -SourcePath $screenshotFolder

    $logFolders = @(
        (Join-Path $RepoRoot "artifacts\wave-logs\$waveId"),
        (Join-Path $screenshotFolder "runtime-logs")
    )

    foreach ($logFolder in $logFolders) {
        if (Test-Path $logFolder) {
            Copy-ToStage -RepoRoot $RepoRoot -StageRoot $stageRoot -SourcePath $logFolder
        }
    }

    foreach ($optionalLog in @($config["expected_outputs"]["optional_logs"])) {
        $resolved = Resolve-RepoPath -RepoRoot $RepoRoot -Path $optionalLog
        if (Test-Path $resolved) {
            Copy-ToStage -RepoRoot $RepoRoot -StageRoot $stageRoot -SourcePath $resolved
        }
    }

    if (Test-Path $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    Compress-Archive -Path (Join-Path $stageRoot "*") -DestinationPath $zipPath -CompressionLevel Optimal
    Write-Host "REVIEW PACK: PASS - $zipPath"
    exit 0
} catch {
    Write-Host "REVIEW PACK: FAIL - $($_.Exception.Message)"
    exit 1
} finally {
    if (Test-Path $stageRoot) {
        Remove-Item -LiteralPath $stageRoot -Recurse -Force
    }
}
