/// Config for the Google **Directions** API (different from the Maps SDK
/// key set natively in AndroidManifest.xml / AppDelegate.swift — that one
/// only draws map tiles and isn't reachable from Dart code).
///
/// To get the road-following route (instead of the old straight line
/// between pickup and drop) working:
///   1. In Google Cloud Console, on the SAME project as your Maps SDK key,
///      enable the "Directions API".
///   2. Either reuse your existing key (if it has no API restriction, or
///      you add "Directions API" to its allowed APIs) or create a new
///      key restricted to "Directions API" only.
///   3. Run the app with:
///        flutter run --dart-define=DIRECTIONS_API_KEY=your_key_here
///      (or bake it in below for local testing — just don't commit a real
///      key to a public repo).
///
/// If this is left empty, [DirectionsService] returns null and
/// `RideRouteMap` silently falls back to the old straight-line polyline —
/// nothing crashes, the map just looks less realistic.
class MapsConfig {
  static const String directionsApiKey = String.fromEnvironment(
    'DIRECTIONS_API_KEY',
    defaultValue: '',
  );
}
