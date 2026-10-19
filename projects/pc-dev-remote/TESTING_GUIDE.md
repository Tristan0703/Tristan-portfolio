# 🧪 PCremote Full Testing Workflow Guide

This document outlines the multi-stage process for running end-to-end integration checks across both the **Client Application** (React/TypeScript, mobile view) and the **Host Application** (C#/.NET Desktop).

## Prerequisites

Before starting any tests, ensure the following are installed:
1.  **Node.js & npm:** For `ClientApp` dependencies and Cypress.
2.  **.NET SDK 8.0:** For compiling and running `HostApp`.
3.  **Cypress CLI:** Installed in `ClientApp/node_modules/.bin`.

## ⚙️ Phase 1: Build & Dependency Preparation (Run Script)

The main entry point for preparation is the `run_all_apps.bat` script located at the root of the workspace. This must be run first to ensure all dependencies are installed and projects are compiled.

**Action:**
Open `d:\Privatework\PCremote\run_all_apps.bat` and execute it in a terminal. This script handles:
1.  Installing client dependencies (`npm install --force` inside `ClientApp`).
2.  Cleaning and building the host application (`dotnet clean` & `dotnet build` inside `HostApp`).

> **❗ Note:** If this phase fails, do not proceed until the root cause (Node/NPM error or C# compilation error) is resolved.

## 🧪 Phase 2: Client Application E2E Testing (Cypress)

This verifies the user interface and core viewing logic of the client on a simulated device environment.

**Action:**
Navigate to `ClientApp` and run Cypress in your terminal:
```bash
cd ClientApp
npx cypress run --e2e
```
*   **Verification Goal:** Ensure that connecting, disconnecting, and displaying remote video streams are handled correctly through the UI layer defined by `RemoteViewScreen.cy.ts`.

## 🛠️ Phase 3: Host Application Unit/Integration Testing (xUnit)

This verifies the business logic of the host components without needing a full graphical runtime environment (e.g., testing pure service communication).

**Action:**
Navigate to `HostApp\Tests` and run the tests using the .NET CLI:
```bash
dotnet test HostApp.Tests.csproj
```
*   **Verification Goal:** This checks isolated functionality for services like encoding, network connectivity, coordinate management, and input processing against mock or dummy inputs.

## 🚀 Phase 4: Full Integrated E2E Simulation (The Ultimate Check)

This is the final test where both sides are run simultaneously to validate the entire data pipeline from capture to view.

**Action:**
1.  **(Start Host)** Open a terminal, navigate to `HostApp`, and run the server process (requires manual setup of arguments):
    ```bash
    dotnet run --project HostApp/HostApp.csproj & 
    # Keep this terminal open for the host service.
    ```
2.  **(Start Client)** In a **second** terminal, navigate to `ClientApp` and start the dev server (or use an internal test runner):
    ```bash
    cd ClientApp
    npx react-native start --platform android
    # Use this to manually open or trigger testing flow via Cypress.
    ```

## ✅ Summary Checklist

| Component | Tool/File | Command/Action | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Setup** | `run_all_apps.bat` | Execute in terminal | Implemented | Updates build dependencies and phases. |
| **Client E2E** | `cypress/e2e/*.cy.ts` | `npx cypress run --e2e` | Ready | Tests UI flow against remote viewing component. |
| **Host Unit Test**| `HostApp/Tests/**Tests.cs` | `dotnet test HostApp.Tests.csproj` | Ready | Covers core service logic (Encoder, Network, etc.). |
| **Full E2E** | Multiple Terminals | Orchestrate Start -> Cypress Run | Guide Provided | Requires manual step execution described above. |