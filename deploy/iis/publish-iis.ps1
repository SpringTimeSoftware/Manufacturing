param(
    [string]$Configuration = "Release",
    [string]$RepoRoot = (Resolve-Path "$PSScriptRoot\..\..").Path,
    [string]$PublishDir = ""
)

$ErrorActionPreference = "Stop"

$serverSolution = Join-Path $RepoRoot "src\server\STS.Mfg.sln"
$hostProject = Join-Path $RepoRoot "src\server\STS.Mfg.Host\STS.Mfg.Host.csproj"
$webRoot = Join-Path $RepoRoot "src\web"
$hostWwwroot = Join-Path $RepoRoot "src\server\STS.Mfg.Host\wwwroot"

if ([string]::IsNullOrWhiteSpace($PublishDir)) {
    $PublishDir = Join-Path $RepoRoot "artifacts\iis-publish"
}

Write-Host "Building web assets..."
Push-Location $webRoot
try {
    npm ci
    npm run build
    npm run build:host
}
finally {
    Pop-Location
}

if (-not (Test-Path (Join-Path $hostWwwroot "index.html"))) {
    throw "Host wwwroot does not contain index.html after web build."
}

Write-Host "Building server solution..."
dotnet build $serverSolution -c $Configuration

Write-Host "Publishing IIS-ready host to $PublishDir..."
dotnet publish $hostProject -c $Configuration -o $PublishDir

$forbiddenSourcePaths = @(
    (Join-Path $PublishDir "src"),
    (Join-Path $PublishDir "node_modules")
)

foreach ($path in $forbiddenSourcePaths) {
    if (Test-Path $path) {
        throw "Publish output contains forbidden raw source/tooling path: $path"
    }
}

Write-Host "IIS publish folder is ready: $PublishDir"
