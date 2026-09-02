# Smart Courier - local backend launcher
# Run this from the repository root in VS Code PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\RUN-BACKEND.ps1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
    Write-Host ""
    Write-Host "ERROR: .env file not found." -ForegroundColor Red
    Write-Host "Copy .env.example to .env and enter your MongoDB Atlas URI and JWT secret." -ForegroundColor Yellow
    exit 1
}

# Export simple KEY=VALUE entries from .env into the current process.
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match '^\s*([^=]+?)\s*=\s*(.*)\s*$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

if ([string]::IsNullOrWhiteSpace($env:MONGODB_URI) -or $env:MONGODB_URI -like "*<PASSWORD>*") {
    Write-Host "ERROR: MONGODB_URI is missing or still contains <PASSWORD>." -ForegroundColor Red
    exit 1
}
if ([string]::IsNullOrWhiteSpace($env:JWT_SECRET) -or $env:JWT_SECRET -like "*REPLACE_WITH*") {
    Write-Host "ERROR: JWT_SECRET is missing or still uses the example value." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Smart Courier backend..." -ForegroundColor Cyan
Write-Host "MongoDB database: configured through MONGODB_URI" -ForegroundColor DarkGray
Set-Location $backend

if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Maven is not installed or not on PATH." -ForegroundColor Red
    Write-Host "Install Maven, restart VS Code, then run this script again." -ForegroundColor Yellow
    exit 1
}

mvn clean spring-boot:run
