
# Remote Desktop Clone Project

This project aims to replicate a basic remote desktop experience using NetBird for networking, .NET/C# for the Windows Host application, and React Native for the mobile client.

## 🛠️ Prerequisites
Before starting, ensure you have the following installed and configured:
1.  **Windows SDK:** Required for native screen capture APIs (Windows Target).
2.  **.NET SDK:** Must be version 8.0 or newer.
3.  **Node.js & Yarn/NPM:** For managing the React Native client dependencies.
4.  **NetBird Account:** A running account is necessary to generate test credentials for connectivity testing.

## 🚀 Setup Instructions (Initial Scaffolding)
1.  Navigate to `d:\Privatework\PCremote`.
2.  For a complete build, ensure all placeholder SDKs are updated with real implementations/packages.

### Part A: Windows Host Application (.NET/C#)
The host app handles capturing the screen and monitoring local input.

**Goal:** Compile and run `HostApp` to activate services.
1. **Dependencies:** Update `d:\Privatework\PCremote\HostApp\HostApp.csproj` with actual NuGet package references (e.g., for WinAPI access).
2. **Build:** Run the following command in the root directory:
   ```bash
   dotnet build HostApp/HostApp.csproj
   ```
3. **Run:** To simulate running the service, you would typically call `HostApp.exe`. For testing, ensure required NetBird credentials are set in your environment variables or passed to `NetbirdService.ConnectAsync()`.

### Part B: Mobile Client Application (React Native)
The client runs on Android/iOS and handles receiving streams and injecting input.

**Goal:** Run the mobile application on a physical device or emulator.
1. **Dependencies:** Navigate into the client directory:
   ```bash
   cd ClientApp
   npm install # Or yarn install
   ```
2. **Run (Android):**
   ```bash
   npx react-native run-android
   ```
3. **Run (iOS):**
   ```bash
   npx react-native run-ios
   ```

## ⚙️ Development Checklist Status
- [x] Project Structure Scaffolding: Complete (HostApp, ClientApp).
- [x] Networking Placeholder: Complete (`NetbirdService`, `NetworkService`).
- [x] Host Core Logic: Screen Capture & Input Services created.
- [x] Client Core Logic: View and connection logic scaffolded.

---
---
**Next Steps:** The implementation now requires replacing all placeholders (e.g., `NetbirdSdkPlaceholder`, `Bitmap` capture, `InputService` hooks) with actual platform-specific code to achieve full functionality.

## 🚀 Mobile Client Deployment Guidance (Android/iOS)
Since the workspace includes React Native elements in `ClientApp/`, here is the general guidance for getting the client app onto your physical phone:

**Target Platform Setup:**
*   **General**: Ensure you have configured development access on your physical device (e.g., USB debugging enabled on Android, Developer Mode setup on iOS).
*   **Dependencies**: The `ClientApp` manages dependencies via `package.json`. Always run `npm install` or `yarn install` inside the `ClientApp` folder before building for a new platform.

**Building & Running:**
1.  **Android (APK/AAB)**: Use Android Studio or CLI commands (`npx react-native run-android`) after ensuring Gradle builds are configured correctly in the workspace's build pipeline.
2.  **iOS**: Use Xcode or CLI commands (`npx react-native run-ios`). Be aware of Apple Developer Program requirements for signing and distribution.

Please consult platform-specific guides (Google/Apple) if you encounter certificate or provisioning issues, as these are outside the scope of the current codebase changes.
