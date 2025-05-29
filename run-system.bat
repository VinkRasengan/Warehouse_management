@echo off
title Warehouse Management System Launcher
color 0A
echo.
echo ========================================
echo   🚀 Warehouse Management System
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check if PowerShell is available
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PowerShell not found!
    echo Please install PowerShell and try again.
    pause
    exit /b 1
)

echo 📁 Current directory: %CD%
echo.
echo 🔧 Starting system setup...
echo Please wait, this may take a few minutes...
echo.

REM Run the PowerShell script with proper execution policy
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0start-system-simple.ps1'"

if %errorlevel% equ 0 (
    echo.
    echo ✅ System started successfully!
    echo 🌐 Frontend: http://localhost:3000
    echo 🎯 Login: admin@warehouse.com / admin123
) else (
    echo.
    echo ❌ Error occurred during startup!
    echo Check the error messages above.
)

echo.
echo Press any key to exit...
pause >nul
