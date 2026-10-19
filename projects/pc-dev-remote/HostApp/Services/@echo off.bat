@echo off
setlocal ENABLEDELAYEDEXPANSION

REM --- Project Launch Script: run_all_apps.bat ---
REM This script automates the sequence of setup and running the client and host applications.
REM ----------------------------------------------------------

TITLE Remote Desktop Client/Host Launcher - PCremote

echo ======================================================
echo 🚀 Starting Multi-Stage Build and Run Process...
echo (This will install dependencies for NPM, then build with dotnet.)
echo ======================================================

REM --- PHASE 1: CLIENT APP SETUP & BUILD (REACT NATIVE) ---
echo.
echo [PHASE 1/3] Preparing ClientApp Dependencies...
cd "ClientApp"

REM Use 'npm ci' for clean installs if package-lock.json exists, otherwise 'npm install'.
npm install --force 

if %ERRORLEVEL% neq 0 (
    echo !!! ERROR: Failed to install client dependencies. Check your Node/NPM setup and permissions. Exiting. !!!
    goto :cleanup
)

echo Client App Dependencies installed successfully.

REM --- PHASE 2: HOST APP BUILD (.NET CORE) ---
echo.
echo [PHASE 2/3] Building Host Application (C#)...
cd "HostApp"

dotnet clean
dotnet build HostApp.csproj

if %ERRORLEVEL% neq 0 (
    echo !!! ERROR: Failed to build Host App. Check C# compiler errors and NuGet references in the project file. Exiting. !!!
    goto :cleanup
)

REM --- PHASE 3: EXECUTION / LAUNCH ---
echo.
echo [PHASE 3/3] BUILD COMPLETE! Launch instructions below.
echo ======================================================
echo ✅ BUILD SUCCESSFUL! The architecture is ready for execution.
echo To test the streaming loop, please run these commands manually after verifying all dependencies:

echo 1. Start the Host (Server) side: cd ..\HostApp && dotnet run --project HostApp/HostApp.csproj & (Wait for connection confirmation)
echo 2. Start the Client (Remote Viewer): cd .\ClientApp && npx react-native start --platform android (or ios)

echo ======================================================

:cleanup
echo.
echo Script finished execution attempt. Check error messages above for failure points.
pause