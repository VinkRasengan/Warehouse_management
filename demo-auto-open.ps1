# Demo script to test auto-open browser functionality
# This script demonstrates the new auto-open feature

Write-Host "🚀 Warehouse Management System - Auto-Open Demo" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host "`n📋 Available deployment options:" -ForegroundColor Blue
Write-Host "1. Deploy with auto-open (default)" -ForegroundColor White
Write-Host "   .\deploy-local-simple.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy without auto-open" -ForegroundColor White  
Write-Host "   .\deploy-local-simple.ps1 -OpenBrowser:`$false" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy with explicit auto-open" -ForegroundColor White
Write-Host "   .\deploy-local-simple.ps1 -OpenBrowser" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open browsers for running services" -ForegroundColor White
Write-Host "   .\open-services.ps1" -ForegroundColor Gray

Write-Host "`n🎯 What happens with auto-open:" -ForegroundColor Magenta
Write-Host "✅ Checks if API Gateway (http://localhost:5000) is ready" -ForegroundColor Green
Write-Host "✅ Checks if Frontend (http://localhost:3000) is ready" -ForegroundColor Green  
Write-Host "✅ Opens browsers automatically when services are available" -ForegroundColor Green
Write-Host "⏱️  Waits up to 15 seconds for each service to be ready" -ForegroundColor Yellow
Write-Host "⚠️  Shows manual URLs if services aren't ready" -ForegroundColor Orange

Write-Host "`n🔧 Demo accounts for testing:" -ForegroundColor Blue
Write-Host "Email: admin@warehouse.com | Password: admin123" -ForegroundColor White
Write-Host "Username: demo | Password: demo" -ForegroundColor White

$choice = Read-Host "`n❓ Would you like to run a demo deployment now? (y/N)"

if ($choice -eq 'y' -or $choice -eq 'Y') {
    Write-Host "`n🚀 Starting demo deployment with auto-open..." -ForegroundColor Green
    .\deploy-local-simple.ps1
} else {
    Write-Host "`n👍 Demo completed. You can run any of the commands above when ready!" -ForegroundColor Cyan
    Write-Host "💡 Tip: The auto-open feature is enabled by default for better user experience." -ForegroundColor Yellow
}
