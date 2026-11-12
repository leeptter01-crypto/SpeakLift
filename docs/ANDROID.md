# SpeakLift Android Preview

Version: 0.1.0-preview. Package: `com.speaklift.app`. Android 8.0 (API 26) or newer.

This is an installable, debug-signed Android preview, not an app-store release. It bundles the current web course rather than loading a hosted website. Existing browser accounts/progress are not migrated into Android's isolated app storage. Uninstalling clears that storage; installing a later APK with the same package and signing certificate preserves it.

## Capabilities And Limits

- The lesson pages, vocabulary, review queue and local account demo are bundled for offline use.
- Microphone access is requested only by the trusted local HTTPS asset origin, after a follow-along action. Only audio capture is allowed; no camera, storage or contacts permissions are requested.
- The existing 30-second recording, replay and explicit Continue behavior are retained. Moving to the background cancels capture and playback.
- Android System WebView/recognition-provider support varies. Recording does not guarantee transcription; no transcript means no score or pass. This release does not add a native/cloud recognizer or acoustic pronunciation scoring.
- Existing synthesized demonstration speech may be unavailable in Android WebView. The native menu offers the web version as a fallback. Licensed human recordings remain a separate follow-up, not a capability of this APK.
- Email/SMS verification delivery, Google OAuth and multi-device accounts are not implemented. Use only test data and a dedicated password. The APK identifies these demo limits on its login screen.
- No recording is uploaded by the app. Android backup is disabled. Assets are served through AndroidX WebViewAssetLoader, not permissive file:// access or a JavaScript/native interface.

## Rebuild On Windows

Use JDK 17, Gradle 8.9, Android SDK Platform 35 and Build Tools 35.0.0. First install the official SDK tools and accept their licenses. No system-wide environment changes are necessary.

```powershell
.\scripts\Build-Android.ps1 -AndroidSdk D:\path\to\sdk -ToolStateRoot D:\path\to\private-build-state
```

On the first build, `-GradlePath D:\path\to\gradle-8.9\bin\gradle.bat` may be used. The Gradle wrapper downloads the same pinned distribution for subsequent builds. The output is `releases/SpeakLift-0.1.0-preview.apk` plus its SHA-256 checksum. The script runs unit tests and Android lint before producing the deliverable.

Do not publish the debug keystore or private build-state folder. Keep its signing certificate stable for in-place test updates. A production release needs a privately held release key and the remaining service work above.

## Device Check

1. Install the APK on Android and allow installation only for the chosen file manager/browser when prompted. Disable that installer permission afterward if it is no longer needed. APKs do not install on iPhone/iPad.
2. Register a disposable local test account using the displayed demo code.
3. Enter the speaking step, tap Start follow-along, allow microphone access, speak, finish and replay.
4. Repeat with microphone denied, then retry after allowing it. Check the 30-second stop and background cancellation.
5. Check that returning to the app retains the learning cursor; no transcription must not pass a lesson.

Physical-device microphone and audio verification must be reported separately from build/unit-test success.

## Android References

- [WebViewAssetLoader](https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader)
- [WebView permission requests](https://developer.android.com/reference/android/webkit/PermissionRequest)
- [Android Gradle Plugin 8.7 compatibility](https://developer.android.com/build/releases/agp-8-7-0-release-notes)
