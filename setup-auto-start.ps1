# Script to setup auto-start for Warehouse Management System
Write-Host "⏰ Setting up auto-start for Warehouse Management System..." -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "📝 Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

$currentPath = Get-Location
$taskName = "WarehouseManagementSystem"

try {
    # Remove existing task if it exists
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "🗑️ Removing existing task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    # Create new scheduled task
    Write-Host "📅 Creating scheduled task..." -ForegroundColor Blue

    # Task Action
    $action = New-ScheduledTaskAction -Execute "powershell.exe" `
        -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$currentPath\setup-complete-system.ps1`""

    # Task Trigger (at startup)
    $trigger = New-ScheduledTaskTrigger -AtStartup

    # Task Settings
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

    # Task Principal (run as current user)
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

    # Register the task
    Register-ScheduledTask -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Description "Auto-start Warehouse Management System at Windows startup"

    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
    Write-Host "🔄 The system will now start automatically when Windows boots" -ForegroundColor Cyan

    # Ask if user wants to start the task now
    $response = Read-Host "`n❓ Do you want to start the system now? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "🚀 Starting Warehouse Management System..." -ForegroundColor Green
        Start-ScheduledTask -TaskName $taskName
    }

} catch {
    Write-Host "❌ Error setting up auto-start: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Management Commands:" -ForegroundColor Blue
Write-Host "  View task: Get-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host "  Start task: Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host "  Stop task: Stop-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host "  Remove task: Unregister-ScheduledTask -TaskName '$taskName'" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
