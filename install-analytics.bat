@echo off
cd /d C:\Users\chhab\OneDrive\Desktop\BackendProject\SiteBeacon\server
echo Installing analytics dependencies...
call npm install chart.js chartjs-node-canvas
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo SUCCESS: Dependencies installed!
    echo ============================================
    echo.
    echo You can now start the server with:
    echo npm run dev
) else (
    echo.
    echo ERROR: Failed to install dependencies
    exit /b 1
)
