@echo off
setlocal ENABLEDELAYEDEXPANSION

REM --- Project Launcher: run_all_apps.bat ---
REM Default: just runs the already-built host server (instant start).
REM Rebuild everything first with:  run_all_apps.bat -rebuild

REM Security: Set JWT secret for auth (dev default, override in prod)
set JWT_SECRET=dev-secret-change-in-production-min-32-chars-long-enough

set REBUILD=0
if /I "%~1"=="-rebuild" set REBUILD=1
if /I "%~1"=="--rebuild" set REBUILD=1

set ROOT=%~dp0
set EXE=%ROOT%HostApp\bin\Debug\net8.0-windows\PCRemote.HostApp.exe

TITLE Remote Desktop Host - PCremote

if "%REBUILD%"=="1" goto :rebuild

REM ------------------------- RUN ONLY -------------------------
if not exist "%EXE%" (
    echo Host is not built yet. Run:  run_all_apps.bat -rebuild
    goto :done
)

REM Ensure JWT_SECRET is set for auth
set JWT_SECRET=dev-secret-change-in-production-min-32-chars-long-enough

echo ======================================================
echo Starting host server (already-built binary)...
echo Any NetBird device can connect at the URL shown below.
echo Press Ctrl+C to stop.
echo ======================================================
"%EXE%"
goto :done

REM ----------------------- REBUILD MODE ---------------------
:rebuild
echo ======================================================
echo REBUILD MODE: npm + client build + host build
echo ======================================================

echo.
echo [1/3] Client dependencies...
cd /d "%ROOT%ClientApp"
if exist node_modules (
    echo node_modules already present - skipping npm install.
) else (
    set CYPRESS_INSTALL_BINARY=0
    call npm install
    if errorlevel 1 (
        echo !!! ERROR: npm install failed. Exiting. !!!
        goto :done
    )
)

echo [2/3] Building web client...
call npm run build
if errorlevel 1 (
    echo !!! ERROR: Client build failed. Exiting. !!!
    goto :done
)

echo [3/3] Building host app...
cd /d "%ROOT%HostApp"
call dotnet build HostApp.csproj
if errorlevel 1 (
    echo !!! ERROR: Host build failed. Exiting. !!!
    goto :done
)

echo.
echo Build complete. Starting host server...
echo Any NetBird device can connect at the URL shown below.
echo Press Ctrl+C to stop.
echo ======================================================
REM Ensure JWT_SECRET is set for auth
set JWT_SECRET=dev-secret-change-in-production-min-32-chars-long-enough
"%EXE%"

:done
echo.
pause