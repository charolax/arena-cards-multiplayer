# Arena Cards Android APK

The game is bundled in the APK as `app/src/main/assets/index.html`. The GitHub Actions workflow copies the root `index.html` into that location, then builds a debug APK.

## Build from a phone

1. Upload the tested game HTML file to the root of this repository on the `android-app` branch and name it exactly `index.html`.
2. Open the Actions tab and select **Build Arena Cards APK**.
3. If needed, choose **Run workflow** and select branch `android-app`.
4. Open the completed run and download the artifact named `arena-cards-android-apk`.
5. Extract the ZIP artifact, install `app-debug.apk`, and allow installs from your browser/files app when Android asks.

The APK uses the existing Render multiplayer server. Keep the game's HTML unchanged while uploading it; the server URL is already configured in the working game file.
