@echo off
title Warehouse Management - Frontend Only
color 0B
echo.
echo ========================================
echo   🎨 Frontend Only Launcher
echo ========================================
echo.

cd /d "%~dp0"

echo 📁 Current directory: %CD%
echo.
echo 🚀 Starting Frontend only...
echo This will start the React application on port 3000
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0start-frontend.ps1'"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Frontend started successfully!
    echo 🌐 Access: http://localhost:3000
) else (
    echo.
    echo ❌ Error starting frontend!
)

echo.
echo Press any key to exit...
pause >nul
