# Script to create desktop shortcuts for Warehouse Management System
Write-Host "🔗 Creating desktop shortcuts..." -ForegroundColor Green

$currentPath = Get-Location
$desktopPath = [Environment]::GetFolderPath("Desktop")

# Function to create shortcut
function Create-Shortcut {
    param(
        [string]$ShortcutName,
        [string]$TargetPath,
        [string]$Arguments,
        [string]$Description,
        [string]$IconPath = ""
    )
    
    $shortcutPath = Join-Path $desktopPath "$ShortcutName.lnk"
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $TargetPath
    $shortcut.Arguments = $Arguments
    $shortcut.Description = $Description
    $shortcut.WorkingDirectory = $currentPath
    if ($IconPath) {
        $shortcut.IconLocation = $IconPath
    }
    $shortcut.Save()
    
    Write-Host "✅ Created: $ShortcutName" -ForegroundColor Green
}

# Create shortcuts
try {
    # Complete System Shortcut
    Create-Shortcut -ShortcutName "🏗️ Warehouse Management - Complete System" `
                   -TargetPath "powershell.exe" `
                   -Arguments "-ExecutionPolicy Bypass -File `"$currentPath\setup-complete-system.ps1`"" `
                   -Description "Start complete Warehouse Management System (Backend + Frontend)"

    # Frontend Only Shortcut
    Create-Shortcut -ShortcutName "🎨 Warehouse Management - Frontend Only" `
                   -TargetPath "powershell.exe" `
                   -Arguments "-ExecutionPolicy Bypass -File `"$currentPath\start-frontend.ps1`"" `
                   -Description "Start only the Frontend application"

    # Backend Only Shortcut
    Create-Shortcut -ShortcutName "🔧 Warehouse Management - Backend Only" `
                   -TargetPath "powershell.exe" `
                   -Arguments "-ExecutionPolicy Bypass -File `"$currentPath\start-warehouse-system.ps1`"" `
                   -Description "Start only the Backend services"

    # Network Access Shortcut
    Create-Shortcut -ShortcutName "🌐 Warehouse Management - Network Access" `
                   -TargetPath "powershell.exe" `
                   -Arguments "-ExecutionPolicy Bypass -File `"$currentPath\host-network.ps1`"" `
                   -Description "Start system with network access for other devices"

    Write-Host "`n🎉 All shortcuts created successfully!" -ForegroundColor Green
    Write-Host "📍 Check your Desktop for the shortcuts" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error creating shortcuts: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
