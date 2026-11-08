@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Zelda: Link's Awakening - Studio Ghibli Web Edition
echo ========================================================
echo.

if not exist "node_modules" (
    echo [INFO] Dependencies not detected. Running npm install...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo [INFO] Starting Vite development server...
echo [INFO] Opening default browser at http://localhost:5173
echo.
call npm run dev -- --open --host

pause
