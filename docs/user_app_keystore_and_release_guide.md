# GoLongDrive User App - Keystore & Release Guide

## 1. Keystore & Signing Configuration
- **Package Name (Application ID):** `com.golongdrive.userapp`
- **Keystore File:** `user-app/android/app/upload-keystore.jks`
- **Configuration File:** `user-app/android/key.properties`
- **Key Alias:** `golongdrive_user`
- **Keystore Password:** `GoLongDrive@2026`
- **Key Password:** `GoLongDrive@2026`
- **Validity:** 10,000 Days (~27 years, expires March 2054)
- **Algorithm:** RSA 2048-bit (`SHA256withRSA`)
- **Distinguished Name:** `CN=GoLongDrive, OU=Mobile, O=GoLongDrive, L=Surat, ST=Gujarat, C=IN`

---

## 2. Certificate Fingerprints (Google Cloud & Play Console)
- **SHA-1 Fingerprint:**
  ```
  D4:46:C2:FA:2D:DA:88:7C:8C:22:53:B3:82:9B:A9:27:E1:BD:D3:35
  ```
- **SHA-256 Fingerprint:**
  ```
  75:E1:C8:42:DF:A2:0A:08:A8:82:06:B6:14:B0:3F:29:58:81:3C:D0:AD:D8:33:D0:19:41:6D:70:73:CC:FB:94
  ```

---

## 3. Google Cloud Console Setup (Maps SDK)
To prevent `REQUEST_DENIED` errors on Maps in your release build:
1. Open **[Google Cloud Console Credentials](https://console.cloud.google.com/google/maps-apis/credentials)**.
2. Select the **GoLongDrive** project.
3. Click on your Maps API Key (`AIzaSyDCV--o3F41...`).
4. Under **Application restrictions**, choose **Android apps**.
5. Under **Restrict usage to your Android apps**, click **+ Add an item**:
   - **Package name:** `com.golongdrive.userapp`
   - **SHA-1 certificate fingerprint:** `D4:46:C2:FA:2D:DA:88:7C:8C:22:53:B3:82:9B:A9:27:E1:BD:D3:35`
6. Click **Done** and then click **Save** at the bottom. *(Wait 2-5 minutes for Google's servers to sync).*

---

## 4. Commands to Build Final Release Versions

Open Terminal in your `user-app` directory:
```bash
cd /Users/wefix/Documents/chirag-projects/GoLongDrive-Platform/user-app
flutter clean
flutter pub get
```

### A. Build Release APK (For Direct Physical Device Testing)
```bash
flutter build apk --release
```
**Output File:** `build/app/outputs/flutter-apk/app-release.apk`

To install directly to your connected Android phone:
```bash
flutter install --release
# or using adb:
adb install -r build/app/outputs/flutter-apk/app-release.apk
```

### B. Build Android App Bundle (.aab) (Required for Play Console Upload)
```bash
flutter build appbundle --release
```
**Output File:** `build/app/outputs/bundle/release/app-release.aab`

---

## 5. Play Console Rejection Prevention Checklist
- [x] **Package Name:** `com.golongdrive.userapp` matching in `build.gradle.kts` and `AndroidManifest.xml`.
- [x] **Production Keystore:** Configured via `key.properties` and `signingConfigs.getByName("release")`.
- [x] **Native Libraries:** 64-bit binaries (ARM64-v8a) included.
- [x] **Target SDK:** Targets current Android SDK requirements (API 34/35).
- [ ] **Privacy Policy:** Ensure the Play Console Privacy Policy URL explicitly discloses location access (`ACCESS_FINE_LOCATION`) for cab pickup & drop routing.
- [ ] **Version Bump:** Increment `versionCode` in `pubspec.yaml` (e.g. `1.0.0+2`) before each upload.

