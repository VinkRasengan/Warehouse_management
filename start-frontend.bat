@echo off
title Warehouse Management - Frontend
color 0B
echo.
echo ========================================
echo   🎨 Starting Frontend Only
echo ========================================
echo.

cd /d "%~dp0"

if not exist "frontend" (
    echo Error: frontend directory not found!
    pause
    exit /b 1
)

echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

cd frontend

echo Installing dependencies...
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting React development server...
echo Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause
