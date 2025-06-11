# Clean up build files and logs from git tracking
# This script removes build artifacts from git and applies .gitignore

Write-Host "🧹 Cleaning up build files and logs from git..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Function to safely remove from git cache
function Remove-FromGitCache {
    param([string]$Path)
    
    if (Test-Path $Path) {
        try {
            Write-Host "Removing from git cache: $Path" -ForegroundColor Yellow
            git rm -r --cached $Path 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Removed: $Path" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "⚠️  Could not remove: $Path" -ForegroundColor Yellow
        }
    }
}

# Remove build directories
Write-Host "`n🔧 Removing .NET build outputs..." -ForegroundColor Blue

$buildPaths = @(
    "api-gateway-dotnet/bin",
    "api-gateway-dotnet/obj", 
    "api-gateway-dotnet/logs",
    "simple-user-service/bin",
    "simple-user-service/obj",
    "services/*/bin",
    "services/*/obj",
    "services/*/logs"
)

foreach ($path in $buildPaths) {
    if ($path -like "*/*") {
        # Handle wildcard paths
        $parentDir = Split-Path $path -Parent
        $pattern = Split-Path $path -Leaf
        
        if (Test-Path $parentDir) {
            Get-ChildItem $parentDir -Directory | ForEach-Object {
                $fullPath = Join-Path $_.FullName $pattern
                if (Test-Path $fullPath) {
                    Remove-FromGitCache $fullPath
                }
            }
        }
    } else {
        Remove-FromGitCache $path
    }
}

# Remove Node.js build outputs
Write-Host "`n📦 Removing Node.js build outputs..." -ForegroundColor Blue

$nodePaths = @(
    "node_modules",
    "frontend/node_modules",
    "package-lock.json"
)

foreach ($path in $nodePaths) {
    Remove-FromGitCache $path
}

# Remove specific log files
Write-Host "`n📝 Removing log files..." -ForegroundColor Blue

try {
    git rm --cached **/*.log 2>$null
    git rm --cached **/*-*.txt 2>$null
} catch {
    Write-Host "⚠️  Some log files could not be removed" -ForegroundColor Yellow
}

# Apply .gitignore to already tracked files
Write-Host "`n🔄 Applying .gitignore to existing files..." -ForegroundColor Blue

try {
    git rm -r --cached . 2>$null
    git add . 2>$null
    Write-Host "✅ Applied .gitignore rules" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not fully apply .gitignore" -ForegroundColor Yellow
}

# Show current status
Write-Host "`n📊 Current git status:" -ForegroundColor Magenta
git status --porcelain | Select-Object -First 20

$totalFiles = (git status --porcelain | Measure-Object).Count
if ($totalFiles -gt 20) {
    Write-Host "... and $($totalFiles - 20) more files" -ForegroundColor Gray
}

Write-Host "`n✅ Cleanup completed!" -ForegroundColor Green
Write-Host "💡 Tip: Run 'git add .' and 'git commit' to save the cleanup" -ForegroundColor Cyan
