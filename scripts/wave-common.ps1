Set-StrictMode -Version Latest

function ConvertTo-NativeObject {
    param(
        [Parameter(Mandatory)]
        $InputObject
    )

    if ($null -eq $InputObject) {
        return $null
    }

    if ($InputObject -is [System.Collections.IDictionary]) {
        $map = @{}
        foreach ($key in $InputObject.Keys) {
            $map[[string]$key] = ConvertTo-NativeObject -InputObject $InputObject[$key]
        }
        return $map
    }

    if ($InputObject -is [System.Collections.IEnumerable] -and -not ($InputObject -is [string])) {
        $list = New-Object System.Collections.ArrayList
        foreach ($item in $InputObject) {
            [void]$list.Add((ConvertTo-NativeObject -InputObject $item))
        }
        return ,$list.ToArray()
    }

    if ($InputObject -is [pscustomobject]) {
        $map = @{}
        foreach ($property in $InputObject.PSObject.Properties) {
            $map[$property.Name] = ConvertTo-NativeObject -InputObject $property.Value
        }
        return $map
    }

    return $InputObject
}

function Get-RepoRoot {
    param(
        [string]$ScriptRoot = $PSScriptRoot
    )

    return (Resolve-Path (Join-Path $ScriptRoot "..")).Path
}

function Get-WaveConfigPath {
    param(
        [Parameter(Mandatory)]
        [string]$RepoRoot,
        [string]$WaveConfigPath
    )

    if (-not [string]::IsNullOrWhiteSpace($WaveConfigPath)) {
        return (Resolve-Path $WaveConfigPath).Path
    }

    return (Join-Path $RepoRoot "docs\governance\CURRENT_WAVE.yaml")
}

function Resolve-RepoPath {
    param(
        [Parameter(Mandatory)]
        [string]$RepoRoot,
        [Parameter(Mandatory)]
        [string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        throw "Path cannot be empty."
    }

    $trimmedPath = $Path.Trim()
    $isWindowsAbsolute = $trimmedPath -match '^[A-Za-z]:[\\/]'
    $isUncPath = $trimmedPath.StartsWith("\\")

    if ($isWindowsAbsolute -or $isUncPath) {
        return $Path
    }

    $normalized = $trimmedPath.TrimStart("/").Replace("/", "\")
    return Join-Path $RepoRoot $normalized
}

function Get-WaveConfig {
    param(
        [Parameter(Mandatory)]
        [string]$RepoRoot,
        [string]$WaveConfigPath
    )

    $resolvedConfigPath = Get-WaveConfigPath -RepoRoot $RepoRoot -WaveConfigPath $WaveConfigPath

    if (-not (Test-Path $resolvedConfigPath)) {
        throw "Wave config not found: $resolvedConfigPath"
    }

    try {
        $rawConfig = Get-Content -Path $resolvedConfigPath -Raw | ConvertFrom-Json
        $config = ConvertTo-NativeObject -InputObject $rawConfig
    } catch {
        throw "Wave config must be valid JSON-compatible YAML: $resolvedConfigPath"
    }

    $requiredFields = @(
        "wave_id",
        "wave_name",
        "routes_to_capture",
        "modal_routes_to_capture",
        "expected_outputs",
        "requires_backend_validation",
        "requires_db_validation",
        "screenshot_mode",
        "stop_after_completion"
    )

    foreach ($field in $requiredFields) {
        if (-not $config.ContainsKey($field)) {
            throw "Wave config missing required field '$field'."
        }
    }

    return $config
}

function New-CleanDirectory {
    param(
        [Parameter(Mandatory)]
        [string]$Path
    )

    if (Test-Path $Path) {
        Remove-Item -LiteralPath $Path -Recurse -Force
    }

    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    return $Path
}

function Ensure-Directory {
    param(
        [Parameter(Mandatory)]
        [string]$Path
    )

    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    return $Path
}

function Invoke-LoggedCommand {
    param(
        [Parameter(Mandatory)]
        [string]$Label,
        [Parameter(Mandatory)]
        [string]$Command,
        [Parameter(Mandatory)]
        [string]$WorkingDirectory,
        [Parameter(Mandatory)]
        [string]$LogFile
    )

    Ensure-Directory -Path (Split-Path -Path $LogFile -Parent) | Out-Null
    $logDirectory = Split-Path -Path $LogFile -Parent
    $logStem = [System.IO.Path]::GetFileNameWithoutExtension($LogFile)
    $stdoutLog = Join-Path $logDirectory "$logStem.stdout.tmp"
    $stderrLog = Join-Path $logDirectory "$logStem.stderr.tmp"

    try {
        "[$(Get-Date -Format o)] $Label :: $Command" | Set-Content -Path $LogFile

        if (Test-Path $stdoutLog) {
            Remove-Item -LiteralPath $stdoutLog -Force
        }

        if (Test-Path $stderrLog) {
            Remove-Item -LiteralPath $stderrLog -Force
        }

        $process = Start-Process `
            -FilePath cmd.exe `
            -ArgumentList "/d", "/s", "/c", $Command `
            -WorkingDirectory $WorkingDirectory `
            -Wait `
            -PassThru `
            -RedirectStandardOutput $stdoutLog `
            -RedirectStandardError $stderrLog

        foreach ($partialLog in @($stdoutLog, $stderrLog)) {
            if (Test-Path $partialLog) {
                Get-Content -Path $partialLog | Add-Content -Path $LogFile
            }
        }

        if ($process.ExitCode -ne 0) {
            throw "$Label failed with exit code $($process.ExitCode)."
        }
    } finally {
        foreach ($partialLog in @($stdoutLog, $stderrLog)) {
            if (Test-Path $partialLog) {
                Remove-Item -LiteralPath $partialLog -Force
            }
        }
    }
}

function Get-PackageScripts {
    param(
        [Parameter(Mandatory)]
        [string]$PackageJsonPath
    )

    if (-not (Test-Path $PackageJsonPath)) {
        return @{}
    }

    $package = ConvertTo-NativeObject -InputObject (Get-Content -Path $PackageJsonPath -Raw | ConvertFrom-Json)
    if ($package.ContainsKey("scripts")) {
        return $package["scripts"]
    }

    return @{}
}

function Test-PortListening {
    param(
        [Parameter(Mandatory)]
        [int]$Port
    )

    return $null -ne (Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1)
}

function Wait-ForPort {
    param(
        [Parameter(Mandatory)]
        [int]$Port,
        [Parameter(Mandatory)]
        [string]$Label,
        [int]$TimeoutSeconds = 60
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-PortListening -Port $Port) {
            return
        }

        Start-Sleep -Seconds 1
    }

    throw "$Label did not start listening on port $Port within $TimeoutSeconds seconds."
}

function Get-RepoBackendProcesses {
    return Get-CimInstance Win32_Process |
        Where-Object {
            $_.Name -eq "dotnet.exe" -and
            $_.CommandLine -and
            $_.CommandLine -match "STS\.Mfg\.Host"
        }
}

function Stop-RepoBackendProcesses {
    $processes = @(Get-RepoBackendProcesses)
    foreach ($process in $processes) {
        try {
            Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
        } catch {
            Write-Warning "Unable to stop backend process $($process.ProcessId): $($_.Exception.Message)"
        }
    }
}

function Start-LoggedProcess {
    param(
        [Parameter(Mandatory)]
        [string]$WorkingDirectory,
        [Parameter(Mandatory)]
        [string]$Command,
        [Parameter(Mandatory)]
        [string]$StdOutLog,
        [Parameter(Mandatory)]
        [string]$StdErrLog
    )

    Ensure-Directory -Path (Split-Path -Path $StdOutLog -Parent) | Out-Null
    $wrappedCommand = "Set-Location '$WorkingDirectory'; $Command"

    return Start-Process `
        -FilePath powershell.exe `
        -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $wrappedCommand `
        -PassThru `
        -RedirectStandardOutput $StdOutLog `
        -RedirectStandardError $StdErrLog
}

function Copy-ToStage {
    param(
        [Parameter(Mandatory)]
        [string]$RepoRoot,
        [Parameter(Mandatory)]
        [string]$StageRoot,
        [Parameter(Mandatory)]
        [string]$SourcePath
    )

    if (-not (Test-Path $SourcePath)) {
        throw "Required artifact not found: $SourcePath"
    }

    $resolvedSource = (Resolve-Path $SourcePath).Path
    $relativePath = $resolvedSource.Substring($RepoRoot.Length).TrimStart("\")
    $destinationPath = Join-Path $StageRoot $relativePath
    Ensure-Directory -Path (Split-Path -Path $destinationPath -Parent) | Out-Null
    Copy-Item -LiteralPath $resolvedSource -Destination $destinationPath -Recurse -Force
}

function Ensure-WaveAutomationDependencies {
    param(
        [Parameter(Mandatory)]
        [string]$RepoRoot
    )

    $helperRoot = Join-Path $RepoRoot "scripts\wave-automation"
    $packageJson = Join-Path $helperRoot "package.json"
    $packageLock = Join-Path $helperRoot "package-lock.json"
    $nodeModules = Join-Path $helperRoot "node_modules\puppeteer-core"

    if (-not (Test-Path $packageJson)) {
        throw "Wave automation helper package is missing: $packageJson"
    }

    if (-not (Test-Path $nodeModules)) {
        $installCommand = if (Test-Path $packageLock) { "npm.cmd ci" } else { "npm.cmd install" }
        Invoke-LoggedCommand `
            -Label "wave-automation-install" `
            -Command $installCommand `
            -WorkingDirectory $helperRoot `
            -LogFile (Join-Path $RepoRoot "artifacts\wave-logs\wave-automation-install.log")
    }
}
