# In-App Turn-by-Turn Navigation

## What changed from the last version
Previously "Start Navigation" launched the external Google Maps app. Now it
opens a full-screen **in-app navigation screen** — everything renders
inside your own app, no handoff.

### New file
- `lib/features/navigation/in_app_navigation_screen.dart` — the real
  navigation UI:
  - Live GPS tracking via `Geolocator.getPositionStream`
  - Chase camera: tilted (55°) and rotated to match the driver's heading,
    like Google Maps / Uber / Ola / Rapido navigation mode
  - Top banner with the current turn instruction (e.g. "Turn right onto MG
    Road — 200 m"), pulled from the Directions API's step-by-step data and
    auto-advances as the driver reaches each turn
  - Bottom bar with live ETA + remaining distance, recalculated as the
    driver moves
  - Recenter button, arrival state, "End" button

### Updated
- `lib/core/data/directions_service.dart` — now also returns the
  turn-by-turn `steps` (instruction text, maneuver icon code, distance,
  start/end point of each step) needed to drive the banner above, plus
  total distance/duration in raw numbers (not just display text).
- `lib/core/widgets/ride_route_map.dart` — the **"Start Navigation"**
  button in the fullscreen map dialog now opens `InAppNavigationScreen`
  instead of the external maps app. A small secondary link, "Open in
  Google Maps instead", is still there under it if a driver ever wants the
  external app.

## Setup (unchanged from before)
1. `pubspec.yaml`:
   ```yaml
   dependencies:
     http: ^1.2.0
     url_launcher: ^6.3.0
   ```
2. Directions API key:
   ```
   flutter run --dart-define=DIRECTIONS_API_KEY=your_key_here
   ```
   Without a key, the fullscreen dialog map still shows the old straight
   line, and in-app navigation will show a loading spinner then nothing
   useful — the turn banner and ETA need real step data from the API to
   work, so this feature specifically depends on the key being set.

3. Location permission: the app already asked for it for the small blue
   "my location" dot; the in-app nav screen reuses that same permission
   flow, requesting it again if needed, and shows a clear in-screen message
   (not a crash) if location is off or denied.

## Known simplification (worth knowing about)
ETA is estimated from remaining road distance at a flat ~30 km/h, not from
Google's live-traffic duration estimate re-fetched per GPS fix (that would
mean calling the Directions API repeatedly while driving, which burns
quota fast). If you want traffic-aware ETA, the natural next step is to
re-fetch the route every N minutes or every time the driver strays off the
polyline, and swap in `leg.duration_in_traffic` from the API.
