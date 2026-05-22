@echo off
REM Clean install script for SiteBeacon server

cd /d %~dp0server

echo Cleaning up...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ Removed node_modules
)
if exist package-lock.json (
    del package-lock.json
    echo ✓ Removed package-lock.json
)

echo.
echo Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo ✅ Installation successful!
    echo ==========================================
    echo.
    echo To start the server, run:
    echo npm run dev
) else (
    echo.
    echo ❌ Installation failed
    exit /b 1
)
