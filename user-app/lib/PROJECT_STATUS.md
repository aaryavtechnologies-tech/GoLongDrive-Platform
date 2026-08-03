# GoLongDrive — Rider App — Project Status

> **Keep this file inside `lib/` and update it after every zip handed back.**
> It's the running record of what exists, what's mocked, and what's still
> needed — read this first before making changes in a new session.

## Latest update: Home's Recent Rides tap-through + dark/light theme toggle

### Recent Rides -> Ride Details
Home screen's "Recent Rides" tiles showed a "coming soon" SnackBar on tap —
same root cause as the My Rides Track button fix before it: the row data
was a tiny local `_RecentRide` class (from/to/date/fare only), not the
`RideHistoryItem` model `RideDetailsScreen` needs. Fixed by switching
`_mockRecentRides` in `home_screen.dart` to `RideHistoryItem` and pushing
`AppRoutes.rideDetails` on tap, same as Ride History / My Rides' Past tab.

### Dark/light theme toggle (Profile screen)
Added a real toggle, default dark, matching the spec: light mode swaps the
black background for white, card surfaces for the same gold used for
accents, and text for black — nothing else changes (status colors, gold
accent itself stay identical in both modes).

**New files:**
- `lib/core/theme/theme_controller.dart` — `ChangeNotifier` holding
  `isDark` (default `true`) + `toggle()`. Not persisted — resets to dark on
  app restart; wire SharedPreferences here if that's wanted.
- `lib/core/theme/theme_scope.dart` — `InheritedNotifier` exposing the
  controller via `ThemeScope.of(context)`.

**Changed:**
- `lib/core/theme/app_colors.dart` — added `AppColorPalette` (dark/light)
  + `AppColors.of(context)`. The original static consts (`AppColors.black`,
  `.nearBlack`, `.textPrimary`, `.textSecondary`) are UNCHANGED and still
  used directly by every screen except Profile — those screens are **not
  theme-reactive yet** and will keep rendering dark regardless of the
  toggle. `primaryGold`/`textOnGold` don't change between themes so those
  call sites never need to move.
- `lib/core/theme/app_theme.dart` — added `AppTheme.light`; both are now
  built from `AppColorPalette` so native-widget theming (TextField, AppBar,
  Divider) picks up the toggle automatically.
- `lib/app.dart` — now a `StatefulWidget` hosting the `ThemeController`,
  picks `AppTheme.dark`/`.light` reactively, and wraps the Navigator (via
  `MaterialApp.builder`) in `ThemeScope` so any screen can read it.
- `lib/screens/profile/profile_screen.dart` — fully migrated to
  `AppColors.of(context)`; added the toggle row (`_buildThemeToggle`,
  between the profile header and the menu list).

**Update — theme migration Part 1 + 2 done:** shared `widgets/` (Part 1)
plus the six pre-login screens — `login_screen.dart`,
`register_screen.dart`, `forgot_password_screen.dart`,
`verify_email_screen.dart`, `splash_screen.dart`,
`onboarding_screen.dart` — are now theme-reactive (Part 2). See
`THEME_MIGRATION_TEMP.md` for the full running tracker (Part 3: home +
booking flow; Part 4: rides + remaining profile screens) and per-screen
notes on this pass.

**Still to do:** ~22 remaining screens still read the static
`AppColors.xxx` consts and stay dark when the toggle flips. Migrating one
is mechanical — add `final colors = AppColors.of(context);` at the top of
`build`, then swap `AppColors.black` -> `colors.background`,
`AppColors.nearBlack` -> `colors.surface`, `AppColors.textPrimary` ->
`colors.textPrimary`, `AppColors.textSecondary` -> `colors.textSecondary`,
plus `colors.accentIcon`/`.errorIcon`/`.warningIcon`/`.successIcon` for any
icon sitting on a card/surface. Home screen is the natural next one since
it's the screen right after Profile in the nav flow (Part 3).

## Earlier update: Ride Details screen
Both Ride History and My Rides' "Past" tab had a real gap, not just a
missing backend: tapping a row showed a "coming soon" SnackBar because
there was no detail screen to push. That's fixed.

### New files
- `lib/screens/rides/ride_details_screen.dart` — **new screen**, reached by
  tapping any past-ride row from either Ride History or My Rides (Past
  tab). Sections: status banner, route (pickup → drop), trip meta (car,
  dates, day count, distance), a full fare breakdown (day cost + km cost =
  total, matching the same formula used in the booking flow) — or a flat
  fare card as a fallback when detail fields aren't available — a driver
  card for completed rides, a cancellation-reason note for cancelled ones,
  and "Report an issue" / "Download receipt" actions (both still

  placeholders — no backend for either yet). Every section only renders if
  its underlying data exists, so it degrades gracefully instead of showing
  blank/broken UI for a ride with partial data.

### Rewritten
- `lib/models/ride_history_item.dart` — extended with nullable detail-only
  fields a real past-ride record would have: `carName`, `startDateLabel`/
  `returnDateLabel`, `numberOfDays`, `distanceKm`, `perDayRate`,
  `perKmRate`, `driverName`, `driverRating`, `plateNumber`,
  `paymentLabel`, `cancellationReason`. Existing row-only fields
  (from/to/date/fare/status/vehicleLabel) are unchanged and still
  required — the row widgets in both list screens didn't need to change at
  all. Added `hasFareBreakdown` / `dayCost` / `kmCost` getters used by
  RideDetailsScreen.

### Updated
- `lib/routes/app_routes.dart` — added `rideDetails` route (takes a
  `RideHistoryItem` argument, same missing-args fallback pattern as the
  booking flow's routes).
- `lib/screens/profile/ride_history_screen.dart` — row tap now pushes
  `AppRoutes.rideDetails` instead of a SnackBar; `_mockHistory` enriched
  with full detail data (realistic outstation trips — Lonavala, Pune, Goa —
  matching the new per-day/per-km pricing model instead of the old
  city-taxi mock fares) and a cancelled-ride example with a reason.
- `lib/screens/rides/my_rides_screen.dart` — same wiring for the "Past"
  tab; `_mockPast` kept in sync with `ride_history_screen.dart`'s mock list
  (same `id`s) so the same ride shows identical detail regardless of which
  screen it's opened from.

### Still placeholder on the new screen
- **"Download receipt"** — no receipt-generation backend; SnackBar for now.
- **"Report an issue"** — same gap as Help & Support's "Report an issue"
  entry point; both are pointing at a not-yet-built issue-report flow.

## Full remaining frontend punch list (as of this update)
- **Home screen map** — still a static placeholder panel, not a real map
  like the booking flow / Driver Assigned already have.
- **Issue-report flow** — no screen yet; two entry points (Help & Support,
  Ride Details) both point at this same gap.
- Lower priority, fine as SnackBars until backend exists: "Call driver",
  Help & Support's Chat/Call/Email, Home's search bar.
- **"Track" on My Rides' Upcoming tab** — now pushes the real
  `DriverAssignedScreen` (`my_rides_screen.dart`'s `_rideRequestFromUpcoming`)
  instead of a SnackBar. Still mock: it guesses a `CarModel` from
  `vehicleLabel` and uses a placeholder Mumbai LatLng pair for pickup/drop,
  since `UpcomingRide` doesn't carry real coordinates or a matched vehicle
  yet — swap both once `GET /api/rides/active` returns them.

## Earlier update: Pivot to outstation/multi-day rental pricing
GoLongDrive is **not** a city point-to-point taxi app — it's an outstation
rental app: riders book a specific car for a date range and pay
**(per-day rate × days) + (per-km rate × distance)**. The booking flow was
originally built like a short-trip taxi app (3 generic vehicle tiers,
per-km-only fare, no trip dates) and has now been reworked to match the
real business model, using the rates from the client's official
"GoLongDrive Premium Pricing List" PDF.

### New booking flow
```
Home → Set Locations → Trip Details → Confirm Ride → Driver Assigned → Home
```
(`Trip Details` is a brand-new screen inserted between the two that already
existed.)

### New files
- `lib/screens/booking/trip_details_screen.dart` — **new screen.** Start
  date + return date pickers (native `showDatePicker`, gold-themed to match
  the app), live "X day(s)" recap banner, Continue disabled until both
  dates are set. Return date can never be picked before start date (enforced
  both in `firstDate` and by snapping return→start if it would go invalid).

### Rewritten
- `lib/models/ride_request.dart` — this is the most important file to read
  before doing any further backend work. Changes:
  - `VehicleType` (Hatchback/Sedan/SUV, per-km only) **removed**, replaced
    by `VehicleCategory` (Sedan/MPV/Premium/SUV — matches the pricing PDF's
    4 categories) + `CarModel` (individual car: name, category,
    `perDayRate`, `perKmRate`, seat count).
  - `mockCarModels` — all 11 cars from the pricing PDF, hand-entered
    (see the file for the exact list). **This is the file to swap for a
    real fleet/availability API call.**
  - `RideRequest` extended with `startDate`, `returnDate`, `selectedCar`,
    `distanceKm` (all nullable — filled in incrementally as the rider
    progresses through the flow) plus a `copyWith` method used by every
    screen to pass a fuller object to the next one.
  - `RideRequest.numberOfDays` and `RideRequest.estimatedFare` — computed
    getters implementing the (days × rate) + (km × rate) formula. **These
    are client-side estimates only** — every new file has a "BACKEND
    HOOKUP" comment block flagging that a real pricing/quote endpoint
    should be the source of truth for anything a rider is actually charged,
    not this on-device math.
- `lib/screens/booking/confirm_ride_screen.dart` — vehicle picker changed
  from 3 generic tiers to **category sections, each listing its real car
  models** (name, seats, per-day + per-km rate, computed total fare for
  this specific trip). Rider selects a specific car, not just a category.
  Trip summary card above the list now also shows day count alongside
  distance. Map height is now responsive (`MediaQuery`-based, clamped
  200–260px) instead of a fixed 260px, so it scales sensibly on both short
  and tall phones.
- `lib/screens/booking/driver_assigned_screen.dart` — the vehicle shown is
  now the rider's **actual selected car** (`request.selectedCar.name`)
  instead of a fully random mock model (driver name/rating/plate/ETA are
  still mocked — no real matching backend exists yet, unchanged). Added a
  trip fare summary card (date range, day count, estimated total fare) at
  the bottom of the assigned-driver state.

### Updated
- `lib/routes/app_routes.dart` — added `tripDetails` route (takes a
  `RideRequest` argument, same missing-args fallback pattern as
  `confirmRide`/`driverAssigned`). Flow doc comment at the top updated.
- `lib/screens/booking/set_locations_screen.dart` — "Continue" now pushes
  `AppRoutes.tripDetails` instead of `AppRoutes.confirmRide` directly.

### Responsiveness pass (all new/touched booking screens)
- `TripDetailsScreen` and `ConfirmRideScreen` both wrap their scrollable
  content so nothing overflows on short devices (small Android phones,
  iPhone SE-class screens) — `SafeArea` + scroll view + `LayoutBuilder`/
  `MediaQuery` sizing instead of fixed heights wherever the old code used a
  hardcoded pixel value.
- Text that could overflow (car names, addresses, distance labels) uses
  `maxLines` + `TextOverflow.ellipsis`; the trip summary's meta chips use
  `Wrap` instead of a fixed `Row` so a long distance/duration string can't
  push the day-count chip off-screen on narrow phones.
- All new interactive elements (`_DateCard`, `_CarOption`) have `Semantics`
  labels for screen-reader support, matching the pattern already used by
  `PrimaryButton`/`AppBackButton` elsewhere in the app.

## What existed before this update: Profile sub-screens + My Rides
Previously, Profile's menu rows (Account Details, Payment Methods, Ride
History, Notifications, Help & Support) were all "coming soon" SnackBars,
and there was no dedicated "My Rides" screen — only the 3-item mock list on
Home. This update built out all six as real (still UI-only) screens and
wired the navigation up.

### New files
- `lib/models/user_account.dart` — `UserAccount` (name/email/mobile/gender/
  DOB/emergency contact), seeded via `UserAccount.mock`.
- `lib/models/payment_method.dart` — `PaymentMethod` + `PaymentMethodType`
  enum (card/upi/cash).
- `lib/models/ride_history_item.dart` — `RideHistoryItem` + `RideStatus`
  enum (completed/cancelled) — shared shape used by both Ride History and
  the "Past" tab of My Rides.
- `lib/models/upcoming_ride.dart` — `UpcomingRide` + `UpcomingRideStatus`
  enum (searching/driverAssigned/scheduled) — used by the "Upcoming" tab of
  My Rides.
- `lib/models/notification_item.dart` — `NotificationItem` +
  `NotificationType` enum (ride/promo/account/system).
- `lib/models/faq_item.dart` — `FaqItem` + hardcoded `mockFaqs` list.
- `lib/screens/profile/account_details_screen.dart` — editable profile form
  (reuses `AppTextField`/`Validators`), gender chips, DOB via
  `showDatePicker`, emergency contact fields. "Save Changes" is a mock
  600ms delay + local `setState`, not a real PATCH yet.
- `lib/screens/profile/payment_methods_screen.dart` — saved
  cards/UPI + always-on Cash row, set-default, remove (with confirm
  dialog), and an "Add Payment Method" bottom sheet. The add-sheet is a
  **placeholder only** — real card/UPI collection must go through a
  payment-gateway SDK, never raw fields straight to a backend.
- `lib/screens/profile/ride_history_screen.dart` — full past-rides list
  with All/Completed/Cancelled filter chips.
- `lib/screens/profile/notifications_screen.dart` — notification inbox,
  unread dot + "Mark all read", tap-to-mark-read (state is local only,
  not persisted).
- `lib/screens/profile/help_support_screen.dart` — FAQ accordion (from
  `mockFaqs`) + Chat/Call/Email contact row (all "coming soon" — no
  chat SDK / `url_launcher` wired yet) + "Report an issue" entry point.
- `lib/screens/rides/my_rides_screen.dart` — **My Rides**, reached from
  Home's "Recent Rides" → "View all". Two tabs: **Upcoming** (active/
  scheduled rides, Track/Cancel actions) and **Past** (same data shape as
  Ride History, shown as a summary list).

### Updated
- `lib/routes/app_routes.dart` — added `accountDetails`, `paymentMethods`,
  `rideHistory`, `notifications`, `helpSupport`, `myRides` routes, all
  taking no arguments.
- `lib/screens/profile/profile_screen.dart` — menu rows now
  `Navigator.pushNamed` to their real screens instead of showing
  "coming soon" SnackBars; `_ProfileMenuItem` gained a `route` field.
- `lib/screens/home/home_screen.dart` — "Recent Rides" section header now
  has a "View all" link pushing `AppRoutes.myRides`.

### Every new screen/model has an in-file "BACKEND HOOKUP" comment block
Each new model file and screen file has a clearly marked comment section
(search for `BACKEND HOOKUP`) explaining exactly which endpoint(s) it
needs, where the mock data currently lives, and what to swap it for. Read
those before wiring a real backend — they're written so any engineer (or
AI) picking this up cold can find the integration points fast without
re-reading the whole file.

## What existed before this update
Fully UI-only shell: Splash → Onboarding → Login/Register/VerifyEmail/
ForgotPassword → Home → Profile. Home's search bar, map, and "Book a Ride"
button were all placeholders (`SnackBar` "coming soon"). No maps, no
location, no networking of any kind.

## What this update added: the full booking flow
`Home → Set Locations → Confirm Ride → Driver Assigned → (back to) Home`

### New files
- `lib/core/config/maps_config.dart` — `DIRECTIONS_API_KEY` via
  `--dart-define`, same pattern as the driver app.
- `lib/core/data/directions_service.dart` — real road route (Directions
  API) between two points. Returns `null` on any failure and **logs the
  actual Google `status`/`error_message` via `debugPrint`** rather than
  swallowing it — check the console if a route doesn't draw.
- `lib/core/data/places_service.dart` — Places Autocomplete (search-as-you-
  type suggestions), Place Details (turns a suggestion into real lat/lng),
  and reverse geocoding (turns the rider's GPS fix into a readable pickup
  address). Same fail-quiet-but-log-why pattern as the driver app.
- `lib/core/utils/polyline_decoder.dart` — decodes the Directions API's
  encoded polyline into map points. Copied from the driver app.
- `lib/models/ride_request.dart` — `RideRequest` (pickup/drop address +
  LatLng, carried across the three booking screens), `VehicleType` enum
  with mock per-km rates, `AssignedDriver` (mock driver info).
- `lib/screens/booking/set_locations_screen.dart` — pickup auto-filled from
  GPS + reverse geocoding (editable), destination via live Places
  Autocomplete. Free-typed text alone can never become a pickup/drop point
  — only a resolved suggestion (real lat/lng) can, so the next screen
  always has real coordinates to route with.
- `lib/screens/booking/confirm_ride_screen.dart` — real road route on a
  map (falls back to a straight line if Directions fails), vehicle-tier
  picker (Hatchback/Sedan/SUV) with a mock fare estimate
  (`distance_km * per_km_rate`, rounded to the nearest ₹5).
- `lib/screens/booking/driver_assigned_screen.dart` — simulates driver
  matching (~2.2s "Finding your driver…") then reveals a randomly
  generated mock driver (name/rating/vehicle/plate/ETA). "Call driver" is
  still a coming-soon SnackBar; "Cancel Ride" asks for confirmation then
  pops back to Home.

### Updated
- `lib/routes/app_routes.dart` — added `setLocations`, `confirmRide`,
  `driverAssigned` routes. The latter two require a `RideRequest` in
  `settings.arguments` (falls back to a visible error screen instead of
  crashing if that's ever missing).
- `lib/screens/home/home_screen.dart` — search bar and "Book a Ride" now
  push `AppRoutes.setLocations` instead of showing "coming soon".

## Known mocks / simplifications (worth knowing about)
- **Driver matching is fully mocked** — random name/plate/ETA from
  a small fixed list, no real backend call (vehicle model shown IS real —
  it's the rider's actual selection, see above). Swap `_findDriver()` in
  `driver_assigned_screen.dart` for a real match request when that backend
  exists; the rest of the screen shouldn't need to change.
- **Fares are a client-side mock formula**
  (`per_day_rate * days + per_km_rate * distance`, see
  `RideRequest.estimatedFare`), not real pricing rules (no surge, no
  time-of-day, no promos, no toll/driver-allowance add-ons). Replace with a
  real quote endpoint before this touches real money.
- **Car/fleet list is hardcoded** (`mockCarModels` in `ride_request.dart`)
  — no availability check against the rider's actual dates, no real
  inventory backend.
- **No date-blocking / availability calendar** — a rider can currently pick
  any start/return date; there's no check for whether a car is actually
  free on those dates.
- **"Call driver"** is still a coming-soon SnackBar — no telephony/VOIP
  integration.
- **No ride-cancellation or ride-history backend** — cancel just navigates
  back to Home; nothing is persisted anywhere.
- **Account Details, Payment Methods, Ride History, Notifications, My
  Rides** all render hardcoded mock lists (see each file's "BACKEND
  HOOKUP" comment block for the exact endpoint each one needs).
- **Payment Methods "Add"** is a placeholder form only — do not treat it as
  a real card-collection flow; it must be replaced with a payment gateway's
  tokenization SDK/webview before going anywhere near production.
- **Help & Support's** Chat/Call/Email actions and "Report an issue" are
  all still "coming soon" SnackBars.

## Setup needed to run this
1. `pubspec.yaml` needs (not included in this zip — this delivery is
   `lib/` only):
   ```yaml
   dependencies:
     http: ^1.2.0
     geolocator: ^13.0.0
     google_maps_flutter: ^2.9.0
   ```
   (`flutter_animate` was already in use before this update.)
2. Native Maps SDK key in `AndroidManifest.xml` / `AppDelegate.swift` (map
   tiles) — separate from the key below.
3. Directions + Places API key:
   ```
   flutter run --dart-define=DIRECTIONS_API_KEY=your_key_here
   ```
   Use a key with **no application restriction** (or an IP restriction) for
   this one — an "Android apps"/"iOS apps" restriction only works for
   native SDK calls, not the raw HTTP requests this key is used for. Enable
   **Directions API** and **Places API** on the same Cloud project.
4. Location permission — the rider app will prompt for it when Set
   Locations loads, to auto-fill the pickup field.

## Suggested next step
With Ride Details now built, the two biggest remaining gaps are both
backend-shaped, not frontend-shaped:
1. **Fleet/pricing backend** — replace `mockCarModels` with a real fetch,
   and stand up a quote endpoint so `RideRequest.estimatedFare` isn't
   client-side math. Highest-value swap since it's the core of the pricing
   model.
2. **Driver-matching + ride-history backend** — wire real backends for
   both `DriverAssignedScreen`'s matching flow and `GET /api/rides/history`
   so Ride Details, Ride History, and My Rides all show real data instead
   of mock lists.

On the frontend side, the **Home screen map** (still a static placeholder)
and the **issue-report flow** (referenced by both Help & Support and Ride
Details but not built) are the two remaining UI gaps — see the punch list
above.
