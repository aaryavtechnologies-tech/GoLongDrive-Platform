# TEMP FILE — Light Theme Migration Tracker

> Instruction to AI (Claude): this file is scratch/working notes for a
> multi-part fix, not part of the app. Once every screen listed below is
> migrated and confirmed, DELETE this file — do not ship it as a permanent
> part of the codebase.

## Why this exists
The light/dark toggle (`ThemeController` in `core/theme/theme_controller.dart`)
only worked on `ProfileScreen` because every other screen and several
shared widgets referenced the **static** `AppColors.*` constants (always
dark) instead of the **reactive** `AppColors.of(context)` palette.

Additionally, icons using `AppColors.primaryGold` / `.warning` / `.error`
/ `.success` directly would lose contrast in light mode, because in light
mode the card "surface" color is gold — a gold icon on a gold card, or an
orange "warning" icon on a gold card, effectively disappears.

## Part 1 (this delivery) — DONE
- `core/theme/app_colors.dart`: added reactive `accentIcon`, `errorIcon`,
  `warningIcon`, `successIcon`, `inputBorder` fields to `AppColorPalette`
  so icons/borders stay visible in both modes.
- Migrated all shared widgets in `widgets/` to read `AppColors.of(context)`
  instead of static consts: `app_checkbox.dart`, `app_divider.dart`,
  `app_text_field.dart`, `back_button.dart`, `loading_button.dart`,
  `otp_input.dart`, `password_field.dart`, `primary_button.dart`,
  `secondary_button.dart`, `social_login_button.dart`,
  `progress_indicator_dots.dart`.
- Because every screen composes these widgets, this alone makes inputs,
  buttons, dividers, checkboxes, OTP boxes, and back buttons theme-reactive
  app-wide immediately.

## Part 2 (this delivery) — DONE
Screens migrated to `final colors = AppColors.of(context);` + swap, per
the pattern already used in `profile_screen.dart`:
- [x] screens/auth/login_screen.dart
- [x] screens/auth/register_screen.dart
- [x] screens/auth/forgot_password_screen.dart
- [x] screens/auth/verify_email_screen.dart
- [x] screens/splash/splash_screen.dart
- [x] screens/onboarding/onboarding_screen.dart

Notes on this pass:
- None of these screens have icons sitting on a card/surface background
  (no `accentIcon`/`errorIcon`/`warningIcon`/`successIcon` swaps were
  needed here) — the only "card-like" element was register's password-
  strength meter, whose *unfilled* track used static `AppColors.nearBlack`;
  swapped to `colors.divider` (a muted track color) rather than
  `colors.surface`, since `colors.surface` is gold in light mode and would
  clash with the gold "Good"-strength fill color.
- `AppTextStyles.link` and `.errorText` were left as their static
  brand-gold / status-red values on all six screens — both already read
  fine against a plain white or black page background, so per the header
  note in `app_colors.dart` these only need the reactive `colors.*Icon`
  treatment when sitting on a card/surface, which none of these do.
- Each screen with multiple `_build*State()` helpers (forgot_password,
  verify_email) reads `AppColors.of(context)` fresh inside each helper
  rather than threading a single `colors` down as a parameter — matches
  how `profile_screen.dart`'s own helper methods do it.

## Part 3 — DONE
- [x] screens/home/home_screen.dart
- [x] screens/booking/set_locations_screen.dart
- [x] screens/booking/trip_details_screen.dart
- [x] screens/booking/confirm_ride_screen.dart
- [x] screens/booking/driver_assigned_screen.dart

Notes on this pass:
- Same mechanical swap as Part 2, plus every icon that sits directly on a
  `colors.surface` card/circle/avatar (not inside its own nested container)
  was moved from `AppColors.primaryGold` to `colors.accentIcon` so it
  doesn't disappear on the gold light-mode card — e.g. the map-placeholder
  icon and recent-ride pickup dot on Home, the pickup/drop dots in
  `set_locations_screen.dart`'s field stack, the date-card icon in
  `trip_details_screen.dart`, the per-km/day meta-chip icon and the
  selected-radio icon in `confirm_ride_screen.dart`'s car list, and the
  driver-avatar/call-button/vehicle-card/fare-summary icons in
  `driver_assigned_screen.dart`.
- Icons that sit on the *plain page background* (not a card) — e.g. the
  car icon inside its own `colors.background` square on Home's recent-ride
  tile, the star rating and route-start dot on Driver Assigned, the map
  polyline/marker colors — were deliberately left as static
  `AppColors.primaryGold`, matching the existing pattern: only
  surface-background icons need the reactive treatment.
- Status-tinted banners (trip-length banner, driver-assigned success
  banner) keep their static `AppColors.success`/`.primaryGold` fill and
  icon, since those are low-opacity tints, not the solid gold `surface`
  color — but their body text was switched to `colors.textPrimary` since
  the static white text would vanish against the near-white tint in light
  mode.
- `trip_details_screen.dart`'s native date-picker dialog
  (`_datePickerTheme`) was also made theme-reactive (dialog background +
  on-surface color now follow `colors.surface`/`.textPrimary`) so the
  system date picker doesn't look out of place against a light-mode
  screen.
- Also fixed a **pre-existing bug** found while doing this pass, not
  scoped to Part 3: `profile_screen.dart`'s avatar icon was still
  `AppColors.primaryGold` sitting directly on `colors.surface` (gold in
  light mode) — gold-on-gold, invisible. Switched to `colors.accentIcon`.
  This is very likely the "red and yellow components disappearing" you
  were seeing, alongside the Home screen not being migrated at all yet.

## Part 4 (after that) — NOT STARTED
- [ ] screens/rides/my_rides_screen.dart
- [ ] screens/rides/ride_details_screen.dart
- [ ] screens/profile/account_details_screen.dart
- [ ] screens/profile/help_support_screen.dart
- [ ] screens/profile/notifications_screen.dart
- [ ] screens/profile/payment_methods_screen.dart
- [ ] screens/profile/ride_history_screen.dart

Every screen in Part 3–4 also has gold/red/warning icons that need
switching from `AppColors.primaryGold` / `.error` / `.warning` to
`colors.accentIcon` / `.errorIcon` / `.warningIcon` wherever the icon sits
on a card/surface/avatar background (see grep list gathered during Part 1
— e.g. `driver_assigned_screen.dart`, `ride_details_screen.dart`,
`confirm_ride_screen.dart`, `trip_details_screen.dart` have several each).
Part 2's screens had no such icons, so this pass didn't touch any.

**When Part 4 is checked off, delete this file.**
