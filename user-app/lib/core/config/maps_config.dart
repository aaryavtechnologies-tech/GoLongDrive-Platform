// lib/core/config/maps_config.dart

/// Config for the Google **Places** and **Directions** APIs (different from
/// the Maps SDK key set natively in AndroidManifest.xml / AppDelegate.swift
/// — that one only draws map tiles and isn't reachable from Dart code).
///
/// Setup, same as the driver app:
///   1. In Google Cloud Console, on the SAME project as your Maps SDK key,
///      enable "Directions API" and "Places API".
///   2. Use a key with NO application restriction (or an IP-address
///      restriction) for this one — an "Android apps" / "iOS apps"
///      restriction only works for native SDK calls, not for the raw HTTP
///      requests this app makes from Dart.
///   3. Run the app with:
///        flutter run --dart-define=DIRECTIONS_API_KEY=your_key_here
///
/// If this is left empty, [DirectionsService] and [GeocodingService] both
/// return null/empty results — nothing crashes, search just won't return
/// suggestions and the map falls back to a straight line.
import 'package:flutter_dotenv/flutter_dotenv.dart';

class MapsConfig {
  static String get directionsApiKey => dotenv.env['DIRECTIONS_API_KEY'] ?? const String.fromEnvironment(
    'DIRECTIONS_API_KEY',
    defaultValue: '',
  );
}
