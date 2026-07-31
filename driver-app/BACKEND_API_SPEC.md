# GoLongDrive — Backend API Spec (for backend developer)

This is generated from the Flutter app's current data shapes and screen
flows, so the backend can be built to match the client exactly — field
names below are taken directly from the Dart models in
`lib/core/models/ride.dart` and `lib/core/data/mock_data.dart`, and from
the fields already collected in `lib/features/registration/registration_provider.dart`.

The app currently runs entirely on hardcoded mock data (`MockData` class)
and does nothing over the network. Every screen that will eventually call
an API has a `// TODO: call ...Service...` comment marking the exact spot.
Search the codebase for `TODO: call` to find every integration point.

---

## 1. Auth flow

| Step | Screen | Needs |
|---|---|---|
| Login | `login_screen.dart` | `POST /auth/login` — phone + password → session token |
| Forgot password | `forgot_password_screen.dart` | `POST /auth/otp/send` — phone → OTP sent |
| OTP verify | `otp_screen.dart` | `POST /auth/otp/verify` — phone + 6-digit code → short-lived reset token; also needs a **resend** endpoint (same as send) |
| Reset password | `reset_password_screen.dart` | `POST /auth/password/reset` — phone (or reset token) + new password |
| Register | 9-step wizard, submitted at the end (`review_step.dart`) | `POST /auth/register` — full payload below, multipart (has file uploads) |

**Suggested endpoints:**
```
POST /auth/login              { phone, password }              -> { token, driverId }
POST /auth/otp/send           { phone }                         -> { success }
POST /auth/otp/verify         { phone, code }                   -> { resetToken }
POST /auth/password/reset     { resetToken, newPassword }       -> { success }
POST /auth/register           multipart form, see §2            -> { driverId, status: "pending_review" }
```

Session handling isn't built yet — the app currently has no token storage.
Recommend a simple bearer token in a header, stored via `flutter_secure_storage`
once real auth lands (not currently a dependency — will need adding to
`pubspec.yaml`).

---

## 2. Registration payload

Collected across all 9 wizard steps in `RegistrationData` (see
`registration_provider.dart` for the authoritative field list). Text
fields map 1:1; the fields marked `(file)` are image uploads from
`DocumentUploadCard` and arrive as local file paths on-device — backend
should accept them as multipart file parts, not paths.

```
Step 1 — Personal:      fullName, phone, email, dateOfBirth
Step 2 — Address:       street, city, state, pincode
Step 3 — Account:       password, confirmPassword (client-side only — don't send confirmPassword), acceptedTerms
Step 4 — Vehicle basic: vehicleBrand, vehicleModel, registrationNumber, vehicleType
Step 5 — Vehicle specs: fuelType, manufacturingYear, seatingCapacity, acAvailable
Step 6 — Identity docs: aadhaarFront (file), aadhaarBack (file), licenseFront (file), licenseBack (file)
Step 7 — Vehicle docs:  rcFront (file), rcBack (file), insuranceCertificate (file), pucCertificate (file)
Step 8 — Photos:        profilePhoto (file), selfiePhoto (file), vehicleFrontPhoto (file)
Step 9 — Review:        no new fields — just submits everything above
```

Expect the driver account to be created in a **pending / under review**
state after submission — the app doesn't yet have a "registration status"
screen, so however that's surfaced (email, SMS, or a status flag returned
from login) should be simple to poll or check on next login attempt.

---

## 3. Ride data — `Ride` model

Exact shape the app expects (from `lib/core/models/ride.dart`):

```json
{
  "id": "string",
  "status": "upcoming | ongoing | completed | cancelled",
  "pickupAddress": "string",
  "dropAddress": "string",
  "customerName": "string",
  "customerPhone": "string",
  "customerRating": 4.9,
  "fare": 340.0,
  "distanceKm": 8.4,
  "durationMin": 22,
  "dateTime": "ISO-8601 string",
  "vehicleModel": "string",
  "vehicleNumber": "string",
  "paymentMethod": "Cash | UPI | ..."
}
```

**Endpoints needed:**
```
GET  /rides?status=upcoming|ongoing|completed|cancelled   -> Ride[]   (Rides tab, filter chips)
GET  /rides/current                                       -> Ride | null  (Dashboard "Upcoming/Current Ride" card, Current Ride screen — not built yet)
GET  /rides/:id                                            -> Ride    (Ride Details screen — not built yet)
POST /rides/:id/accept                                     -> Ride    (needed once Current Ride screen is built)
POST /rides/:id/complete                                   -> Ride
POST /rides/:id/cancel                                     -> Ride
```

The client currently derives `currentRide` / `upcomingRides` /
`completedRides` from one flat list client-side
(`MockData.currentRide` etc. in `mock_data.dart`) — happy to keep doing
that against a single `GET /rides` if pagination/filtering server-side
isn't a priority yet, but flagging in case the ride list grows large.

---

## 4. Earnings data

Used by `earnings_screen.dart`. Two pieces:

**Summary** (currently 4 static getters on `MockData` — `todayEarnings`,
`weekEarnings`, `monthEarnings`, `tripsToday`):
```
GET /earnings/summary   -> { todayEarnings, weekEarnings, monthEarnings, tripsToday }
```

**Transaction history** (`Transaction` model in `mock_data.dart`):
```json
{
  "id": "string",
  "title": "string",
  "amount": 410.0,
  "dateTime": "ISO-8601 string",
  "isCredit": true
}
```
```
GET /earnings/transactions   -> Transaction[]
```
No withdrawal flow exists in the UI yet — the balance card is
display-only for now.

---

## 5. Driver profile

`DriverProfile` model in `mock_data.dart`, used by `profile_screen.dart`
and the Dashboard header:

```json
{
  "name": "string",
  "phone": "string",
  "email": "string",
  "rating": 4.8,
  "totalTrips": 342,
  "vehicleModel": "string",
  "vehicleNumber": "string",
  "memberSince": "ISO-8601 string"
}
```
```
GET  /driver/profile         -> DriverProfile
PATCH /driver/profile        -> DriverProfile   (Profile screen has an "Edit Profile" menu item, not yet wired to a form)
```

---

## 6. Online/offline toggle

The Dashboard has a `Switch` ("You're Online" / "You're Offline") that's
currently local UI state only (`_online` bool in `dashboard_screen.dart`,
never persisted). Needs:
```
POST /driver/status   { online: true|false }   -> { success }
```
and ideally the driver's current status should come back from
`GET /driver/profile` or a dedicated `GET /driver/status` on app launch,
so the toggle reflects reality after a restart.

---

## 7. What's still UI-only (no backend needed yet)

- OTP resend countdown timer — purely client-side, no new endpoint beyond
  the existing send/resend.
- Rides tab filter chips (All/Upcoming/Ongoing/Completed/Cancelled) —
  client-side filtering over whatever `GET /rides` returns.
- Profile screen's Settings menu (Notifications, Help & Support, Privacy
  Policy) — all currently no-op `onTap: () {}`, not wired to anything.

---

## 8. Driver location / live tracking (Phase 7 — maps)

`RideRouteMap` (`lib/core/widgets/ride_route_map.dart`) currently renders
pickup/drop from **static** coordinates already present on the `Ride`
object (`pickupLat/Lng`, `dropLat/Lng` — see §3's `Ride` shape update
below) and shows the driver's *own device* location via
`myLocationEnabled` (client-side GPS only, nothing sent to a server yet).
Two things are still needed once this goes live:

**A. Geocoding the address strings into coordinates**, since right now
only the mock data has lat/lng hardcoded:
```
Option 1: backend geocodes pickupAddress/dropAddress server-side when a
          ride is created, stores lat/lng alongside the address, and
          includes both in every ride response (recommended — one place,
          done once per ride).
Option 2: client-side geocoding via the Geocoding API on every render
          (not recommended — slower, and burns an extra API call every
          time a ride card renders).
```

**B. Broadcasting the driver's live position** (needed once a customer-
facing app wants to show "your driver is 3 min away" on a live map — not
needed for the driver app's own `myLocationEnabled` blue dot, which is
purely local):
```
POST /driver/location   { lat, lng, heading?, timestamp }   -> { success }
```
Open question for you (backend dev): polling (app calls this every N
seconds while `_online == true`) vs a persistent connection (WebSocket/
Firebase Realtime DB/etc.). Polling is simpler to ship first; a socket
matters once ride volume or "smoothness" of the live dot becomes a
priority. Either way, rate/frequency should probably differ between
"online, no active ride" (infrequent, e.g. every 30s) and "mid-trip"
(frequent, e.g. every 3-5s).

## 9. Updated `Ride` shape (§3) — coordinates

`Ride` (`lib/core/models/ride.dart`) gained four **optional** fields in
Phase 7. All existing endpoints in §3 should add these to their response
shape; they're nullable client-side specifically so a ride without
geocoded coordinates yet still renders (map widget falls back to a
placeholder icon rather than crashing):
```json
{
  ...(all fields already listed in §3)...,
  "pickupLat": 12.9757,
  "pickupLng": 77.6079,
  "dropLat": 12.9352,
  "dropLng": 77.6146
}
```

## 10. Open questions for you (backend dev) to weigh in on

1. Auth token type — JWT vs opaque session token — and expected expiry.
2. File upload limits/formats for the document/photo uploads (Step 6–8) —
   the app compresses to `imageQuality: 80` via `image_picker` client-side
   but doesn't enforce dimensions or file size caps.
3. Whether ride status transitions (`upcoming → ongoing → completed`)
   are driver-initiated (via the accept/complete endpoints above) or
   pushed from a dispatch system — affects whether the app needs
   websockets/polling for the Current Ride screen once it's built.
