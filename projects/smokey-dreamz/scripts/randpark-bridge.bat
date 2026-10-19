@echo off
setlocal enabledelayedexpansion
title Smokey Dreamz - Randpark POS Bridge
color 0A

:: ============================================================
:: Smokey Dreamz Randpark Bridge - Staff Launcher
:: ============================================================

:MENU
cls
echo.
echo    =============================================
echo       SMOKEY DREAMZ - RANDPARK POS BRIDGE
echo    =============================================
echo.
echo    [1] Test Connection (Verify Bridge Status)
echo    [2] Run Full Sync (Push Sales + Inventory)
echo    [3] Run Dry-Run (Test Without Changes)
echo    [4] View Latest Log
echo    [5] Exit
echo.
echo    =============================================
echo.

set /p choice="Enter your choice [1-5]: "

if "%choice%"=="1" goto TEST
if "%choice%"=="2" goto SYNC
if "%choice%"=="3" goto DRYRUN
if "%choice%"=="4" goto VIEWLOG
if "%choice%"=="5" goto EXIT

echo.
echo    Invalid choice. Press any key to try again.
pause >nul
goto MENU

:TEST
cls
echo.
echo    Testing connections...
echo.
python "%~dp0randpark-bridge.py" test
echo.
echo.
if %errorlevel% equ 0 (
    echo    [SUCCESS] All connections are working!
    echo    You may now run a full sync.
) else (
    echo    [ERROR] Connection test failed.
    echo    Check the errors above and contact support.
)
echo.
pause
goto MENU

:SYNC
cls
echo.
echo    Running full sync...
echo    This will push new sales and update inventory.
echo.
python "%~dp0randpark-bridge.py" sync
echo.
echo.
if %errorlevel% equ 0 (
    echo    [SUCCESS] Sync completed successfully.
) else (
    echo    [ERROR] Sync failed. Check the log for details.
)
echo.
pause
goto MENU

:DRYRUN
cls
echo.
echo    Running dry-run (no changes will be made)...
echo.
python "%~dp0randpark-bridge.py" dry-run
echo.
echo.
if %errorlevel% equ 0 (
    echo    [SUCCESS] Dry-run completed. Check output above.
) else (
    echo    [ERROR] Dry-run failed.
)
echo.
pause
goto MENU

:VIEWLOG
cls
echo.
echo    Latest log file:
echo.
for /f "delims=" %%i in ('dir /b /o-d "%~dp0logs\*.log" 2^>nul') do (
    set "latest=%%i"
    goto SHOWLOG
)
echo    No log files found.
pause
goto MENU

:SHOWLOG
type "%~dp0logs\%latest%"
echo.
echo.
echo    Press any key to return to menu.
pause >nul
goto MENU

:EXIT
echo.
echo    Closing Randpark POS Bridge...
timeout /t 1 >nul
exit /b 0
