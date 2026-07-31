# Maps Setup — one-time native config (Phase 7)

`google_maps_flutter` is now in `pubspec.yaml` and `RideRouteMap`
(`lib/core/widgets/ride_route_map.dart`) is wired into both Current Ride
and Ride Details. The Dart side is done — but Google Maps needs an API key
wired into your **native** Android/iOS project files, which aren't part of
this zip (this zip only ships `lib/`, `assets/`, and docs, same as every
phase). Do this locally, once, in your full `flutter create`d project.

## 1. Get an API key

1. Go to [Google Cloud Console](https://console.cloud.google.com/) →
   create/select a project.
2. Enable these APIs: **Maps SDK for Android**, **Maps SDK for iOS**.
3. Create an API key under **Credentials**. Restrict it to those two APIs
   (and ideally to your app's package name / bundle ID) before shipping —
   an unrestricted key is a real cost/abuse risk.

## 2. Android — `android/app/src/main/AndroidManifest.xml`

Inside the `<application>` tag (anywhere alongside the other `<meta-data>`
entries), add:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY_HERE" />
```

Also confirm these two permissions are present inside `<manifest>` (needed
for the live driver-location dot — `myLocationEnabled: true` in
`RideRouteMap`):

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Minimum SDK: `google_maps_flutter` requires `minSdkVersion 21` — check
`android/app/build.gradle` and bump it if it's lower.

## 3. iOS — `ios/Runner/AppDelegate.swift`

```swift
import UIKit
import Flutter
import GoogleMaps  // add this import

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("YOUR_API_KEY_HERE")  // add this line
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

And add to `ios/Runner/Info.plist` (needed for the live-location dot):

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>GoLongDrive needs your location to show it on the ride map.</string>
```

## 4. Verify

Run the app and open a ride with coordinates (the ongoing or upcoming mock
ride — see `mock_data.dart`) → Current Ride or Ride Details. You should see
a real map with a gold pickup marker and a blue drop marker. If you instead
see a grey box with a small map icon, `ride.hasRouteCoordinates` is false
for that ride (expected for the completed/cancelled mock rides, which
don't have coordinates yet) — that's the intentional fallback, not a bug.

If the map area is blank/white instead of showing the fallback icon *or*
a real map, the API key step above is the most likely culprit — check
`adb logcat` (Android) or Xcode's console (iOS) for a Maps-specific error.

## 5. Don't commit the key

Keep the real key out of source control — use `--dart-define` or a
gitignored config file and inject it at build time, rather than hardcoding
it into `AndroidManifest.xml`/`AppDelegate.swift` directly if this repo is
public or shared with people who shouldn't have billing access to your
Google Cloud project.
