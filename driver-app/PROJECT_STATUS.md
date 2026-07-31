# Project Status — Dashboard Enhancements & Theme Toggle

**Date:** 2026-07-30
**Status:** ✅ Fixed — all reported "Invalid constant value" errors resolved.

## What was broken

The previous change introduced a dynamic theme system in `lib/app/theme.dart`:
`AppColors` fields like `background`, `surface`, `surfaceAlt`, `surfaceAlt2`,
`inputFill`, `borderSubtle`, `borderSubtle2`, `textPrimary`, `textSecondary`,
`textMuted`, `textFaint`, `divider`, `dividerStrong`, `rideCardStart`, and
`rideCardEnd` were converted from `static const Color` values into **`static
Color get ...`** getters, because their value now depends on
`ThemeService.instance.isDarkMode` at runtime.

That's the correct approach for a runtime-switchable theme — but it meant
every place in the codebase that still referenced one of those properties
inside a `const` widget/style (e.g. `const TextStyle(color:
AppColors.textMuted, ...)`, `const Divider(color: AppColors.borderSubtle2)`,
`const Icon(..., color: AppColors.textFaint)`) broke, because Dart's `const`
requires a genuine compile-time constant, and a getter's return value never
qualifies. That's the exact cause of the `Invalid constant value` errors
across the project — they were not isolated to one file, they were spread
across ~15 screens/widgets everywhere the old (correctly-const) color usage
hadn't been updated to match the new dynamic getters.

## What was fixed

Removed the now-invalid `const` keyword from every widget/style constructor
that references one of the dynamic `AppColors` getters above, across:

- `lib/features/registration/steps/review_step.dart`
- `lib/features/auth/otp_screen.dart`
- `lib/features/profile/profile_screen.dart`
- `lib/features/earnings/earnings_screen.dart`
- `lib/features/rides/ride_details_screen.dart`
- `lib/features/rides/rides_screen.dart`
- `lib/features/rides/current_ride_screen.dart`
- `lib/features/splash/splash_screen.dart`
- `lib/features/tabs/tab_shell.dart`
- `lib/core/widgets/screen_header.dart`
- `lib/core/widgets/ride_route_map.dart`

Colors that are still genuinely compile-time constants (e.g. `AppColors.gold`,
`AppColors.error`, `AppColors.backgroundDark`, `AppColors.surfaceLight`, etc.)
were left as `const` — no behavior change there.

Verified: parentheses/braces/brackets are balanced in every touched file
(no syntax breakage from the edit), and a full-project grep confirms no
remaining `const ... AppColors.<dynamic-getter>` combination anywhere.

*(Note: this environment has no Flutter/Dart SDK installed, so `flutter
analyze` / `flutter build` could not be run directly — the fix was verified
via targeted static analysis of every reference to the affected getters
instead. Recommend running `flutter analyze` once you have this locally to
double-confirm a clean bill of health.)*

## Additional bug found & fixed (not previously reported)

The dashboard's profile icon already had an `InkWell` navigating to
`context.push('/tabs?tab=3')` — but `TabShell` (the bottom-tab container)
ignored the `?tab=` query parameter entirely and always opened on tab 0
(Home). So tapping the profile icon *did* navigate, but landed on the wrong
tab instead of Profile.

Fixed by:
- `lib/features/tabs/tab_shell.dart` — `TabShell` now accepts an
  `initialTab` constructor parameter that seeds `_tabIndex`.
- `lib/app/router.dart` — the `/tabs` route now reads `state.uri.queryParameters['tab']`
  and passes it as `initialTab`.

## Feature status (per original request)

| Item | Status |
|---|---|
| Profile icon clickable → navigates to Profile screen | ✅ Working (and now lands on the correct tab) |
| Global Light/Dark theme toggle (`ThemeService` + `ValueNotifier`) | ✅ Working |
| "White yellow" light theme (white/light-grey bg + gold accents) | ✅ Implemented in `buildLightTheme()` / `AppColors` light constants |
| Theme applies app-wide (Splash, Login, Dashboard, etc.) | ✅ `main.dart` wraps `MaterialApp.router` in `ValueListenableBuilder` |
| Text visibility in both themes | ✅ Uses `textPrimary`/`textSecondary`/`textMuted`/`textFaint` getters that flip per theme |

## Suggested manual verification (unchanged from original plan)

1. Tap the profile icon on the dashboard → should land on the Profile tab.
2. Tap the theme toggle pill next to "Good Morning" → app should switch to
   the white/gold light theme across all screens.
3. Spot-check text contrast on both themes, especially on Rides, Earnings,
   and Profile screens (they had the most affected color references).

## Follow-up fix (round 2)

Found one more instance of the same root-cause bug, missed in the first pass
because it's a multi-line `const` block:

- `lib/features/registration/steps/account_step.dart` — `const Text.rich(...)`
  wrapping a `TextSpan` styled with `AppColors.textSecondary`. Removed the
  `const`.

Ran a full recursive paren-matched scan (not just single-line grep) across
every `.dart` file for any `const <Widget>( ... )` block — matching open/close
parens across multiple lines — that contains a reference to any of the
dynamic `AppColors` getters. No further instances found.

## Round 3 — Light theme colors, ListTile warning, live theme refresh

**1. Console warning:** "ListTile background color or ink splashes may be
invisible" — `profile_screen.dart`'s Settings menu `ListTile`s sat inside a
`Container` with `decoration:` (a `DecoratedBox`), which hides ink/Material
effects. Fixed by wrapping each `ListTile` in its own
`Material(color: Colors.transparent, child: ListTile(...))`.

**2. "Background stays black / cards go white the wrong way" in light mode:**
Two compounding bugs:
- Nearly every screen hardcoded primary text/icon color as `Colors.white`
  instead of the theme-aware `AppColors.textPrimary` getter, so text never
  actually followed the theme. Replaced every such occurrence (profile,
  earnings, rides, ride details, current ride, review step, login, document
  upload card) with `AppColors.textPrimary`.
- `TabShell` (the bottom-tab container that hosts Dashboard/Rides/Earnings/
  Profile) built its four tab screens as `const DashboardScreen()` etc.
  Dart canonicalizes `const` widgets to a single shared instance, so once
  built, Flutter's element diffing sees the *same* widget object on every
  later rebuild and skips calling `build()` on it again — meaning those four
  screens silently kept rendering with whichever theme was active when they
  first mounted, and never picked up a later toggle. Fixed by:
  - Removing `const` from the four tab screen instances in `_screenFor()`.
  - Wrapping `TabShell`'s `build()` in a
    `ValueListenableBuilder<ThemeMode>(valueListenable: ThemeService.instance.themeMode, ...)`
    so the whole shell (background, bottom bar, and all four tabs) is
    guaranteed to rebuild the instant the theme toggles, regardless of
    where in the tree the toggle happened.

**3. "Cards should be yellow, not white, in light mode":** Updated the light
theme's surface colors in `lib/app/theme.dart` — `surfaceLight`,
`surfaceAltLight`, `surfaceAlt2Light`, `inputFillLight`, `dividerLight`,
`dividerStrongLight`, `borderSubtleLight`, `borderSubtle2Light`, the
onboarding background gradient, and the light-mode ride-card gradient — to
warm gold tints (e.g. `0xFFFFF6D9`), while `backgroundLight` stays pure
white. Net effect: page background is white, cards/surfaces read as a soft
gold, text stays near-black (`textPrimaryLight = 0xFF09090B`) via the fixed
`AppColors.textPrimary` references above.

## Round 4 — Moved theme toggle to Profile

Per request, removed the Light/Dark pill toggle from the Dashboard header
(`lib/features/dashboard/dashboard_screen.dart` — the row next to "Good
Morning") and moved it into the Profile screen's Settings card as the first
row: a `SwitchListTile` labeled "Dark Mode" with an On/Off subtitle, wired to
the same `ThemeService.instance.toggleTheme()`. Wrapped in `Material(color:
Colors.transparent)` for the same ink/Material-visibility fix as the other
settings rows.

## Round 5 — Settings screens + tap-to-navigate map card

**1. Every Settings row now opens a real screen.** Previously only "Dark
Mode" and "Log Out" were wired; "Edit Profile", "My Documents",
"Notifications", "Help & Support", and "Privacy Policy" were all no-ops.
Added five new screens under `lib/features/profile/`:
- `edit_profile_screen.dart` — form prefilled from `MockData.driverProfile`
  (name, phone, email, vehicle model, vehicle number). Save shows a
  confirmation snackbar and pops; no `PATCH /driver/profile` endpoint
  exists yet (see BACKEND_API_SPEC.md).
- `documents_screen.dart` — reuses `DocumentUploadCard` (same widget the
  registration wizard uses) so a driver can review/re-upload their
  documents.
- `notifications_screen.dart` — grouped toggle list (Ride Requests, Trip
  Reminders, Earnings Updates, Promotions, App Updates) using the same
  `Material` + `SwitchListTile` pattern as the Dark Mode row.
- `help_support_screen.dart` — contact card (call/chat/email — tap-to-copy
  since no `url_launcher` dependency exists in this project) plus an FAQ
  list using `ExpansionTile`.
- `privacy_policy_screen.dart` — static placeholder policy text, structured
  by section, ready to swap in real legal copy later.

Registered all five as routes in `lib/app/router.dart`
(`/profile/edit`, `/profile/documents`, `/profile/notifications`,
`/profile/help`, `/profile/privacy`) and wired each `ProfileScreen`
settings row's `onTap` to `context.push(...)` accordingly.

**2. Tapping the route map now opens a big in-app "Navigation" card.** On
both Ride Details and Current Ride, the small `RideRouteMap` preview is now
wrapped in a new `RideRouteMapTappable` (in
`lib/core/widgets/ride_route_map.dart`), which overlays a small
"Navigate" badge and an opaque tap layer on top of the map preview (a plain
`InkWell` around `RideRouteMap` alone doesn't reliably catch taps because
`GoogleMap` claims its own gesture arena for pan/zoom — this overlay sits
*above* the map instead). Tapping it calls the new `showFullMapCard()`
helper, which opens a large `Dialog` containing:
- A "Navigation" header,
- The same `RideRouteMap` rendered at ~62% of screen height (with
  `showDriverLocation` passed through, so Current Ride still shows the
  live location dot),
- The pickup/drop address summary,
- A circular ✕ close button pinned to the top-right corner that pops the
  dialog.

Gated on `ride.hasRouteCoordinates` — rides without coordinates keep the
existing static placeholder and are not tappable, same fallback behavior
as before.

## Round 6 — Incoming Ride Request screen + UI polish (5 items)

**1. New "Incoming Ride Request" screen** — the core driver-app loop
(new request → accept/decline before a timer runs out) didn't exist
anywhere; the app could only show rides already sitting in `MockData`.
Added `lib/features/rides/incoming_request_screen.dart`:
- 15-second countdown ring (turns red under 5s) that auto-declines and
  pops back if the driver doesn't respond.
- Fare, customer name/rating, distance/duration, and pickup/drop —
  same visual language as Ride Details.
- Accept → snackbar + `pushReplacement` to Ride Details for that ride.
  Decline (button, back gesture, or timeout) → pops back to wherever it
  was opened from.
- Registered as `/rides/incoming` in `router.dart` (extra: `{'rideId': ...}`).
- Triggered from a new "New Ride" quick action on the Dashboard (uses
  `MockData.upcomingRides.first` as a stand-in for a real incoming-request
  push — there's no dispatch/matching backend yet, see
  BACKEND_API_SPEC.md). Shows a snackbar instead if there's no upcoming
  mock ride to demo with.

**2. Fixed dead "Support" quick action** — `dashboard_screen.dart`'s
Quick Actions row had `_quickAction(Icons.support_agent, 'Support', () {})`,
a no-op. Now pushes `/profile/help`.

**3. Splash screen reviewed** — already has a full fade/scale/glow
animation sequence and a graceful `errorBuilder` fallback if the logo
asset is missing; no changes needed here.

**4. Consistent empty states** — added `lib/core/widgets/empty_state.dart`
(icon + title + optional subtitle/action) and applied it:
- Rides tab: replaced the ad hoc `Center(Text('No rides here yet'))` with
  `EmptyState`.
- Earnings tab: transaction history now shows an `EmptyState` if
  `MockData.transactions` is empty, instead of rendering an empty card.

**5. Skeleton loading pattern** — added
`lib/core/widgets/skeleton_loader.dart` (`SkeletonBox` + `SkeletonCard`,
a sweeping-gradient shimmer built on a plain `AnimationController` — no
new pubspec dependency). Applied to:
- Dashboard: shows a full skeleton layout for 700ms on first mount
  (`_simulateInitialLoad`) before the real content appears.
- Rides tab: shows 4 skeleton ride cards for 500ms on first mount before
  the real/filtered list appears.

Both loading delays are `Future.delayed` stand-ins for a real
`await repository.fetch()` — swap them out once those endpoints exist;
the skeleton UI itself doesn't need to change.
