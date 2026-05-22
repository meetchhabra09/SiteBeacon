@echo off
cd /d C:\Users\chhab\OneDrive\Desktop\BackendProject\SiteBeacon\server

echo Removing old node_modules and lock file...
if exist node_modules (
    rmdir /s /q node_modules
    echo Removed node_modules
)
if exist package-lock.json (
    del package-lock.json
    echo Removed package-lock.json
)

echo.
echo Installing dependencies with fixed chart.js version...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo SUCCESS: Dependencies installed!
    echo ==========================================
    echo.
    echo You can now start the server with:
    echo npm run dev
) else (
    echo.
    echo ERROR: Failed to install dependencies
    exit /b 1
)
