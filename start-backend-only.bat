@echo off
title Warehouse Management - Backend Only
color 0E
echo.
echo ========================================
echo   🔧 Backend Services Launcher
echo ========================================
echo.

cd /d "%~dp0"

echo 📁 Current directory: %CD%
echo.
echo 🚀 Starting Backend services...
echo This will start all API services on ports 5001-5008
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0start-warehouse-system.ps1'"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Backend services started successfully!
    echo 🌐 Swagger UIs available at:
    echo   - Product Service: http://localhost:5001/swagger
    echo   - Inventory Service: http://localhost:5002/swagger
    echo   - Order Service: http://localhost:5003/swagger
    echo   - Customer Service: http://localhost:5004/swagger
) else (
    echo.
    echo ❌ Error starting backend services!
)

echo.
echo Press any key to exit...
pause >nul
