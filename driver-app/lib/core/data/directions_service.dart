import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../config/maps_config.dart';
import '../utils/polyline_decoder.dart';

/// One turn-by-turn instruction from the Directions API — "Turn right onto
/// MG Road", "Continue straight for 800m", etc. Used to drive the in-app
/// navigation instruction banner.
class RouteStep {
  /// Plain-text instruction with HTML tags stripped (the API returns e.g.
  /// "Turn <b>right</b> onto <b>MG Road</b>").
  final String instruction;

  /// Google's maneuver code, e.g. "turn-right", "turn-left", "uturn-left",
  /// "roundabout-right", "merge", "ramp-right". Empty string for a plain
  /// "keep going straight" step (Google omits `maneuver` for those).
  final String maneuver;

  final double distanceMeters;
  final String distanceText;
  final LatLng startLocation;
  final LatLng endLocation;

  const RouteStep({
    required this.instruction,
    required this.maneuver,
    required this.distanceMeters,
    required this.distanceText,
    required this.startLocation,
    required this.endLocation,
  });
}

/// Result of a Directions API lookup: the actual road-following path, the
/// turn-by-turn steps along it, and the real drive distance/duration (as
/// opposed to the crude straight-line distance the app may compute
/// elsewhere).
class RouteResult {
  final List<LatLng> points;
  final List<RouteStep> steps;
  final String distanceText;
  final String durationText;
  final double distanceMeters;
  final double durationSeconds;

  const RouteResult({
    required this.points,
    required this.steps,
    required this.distanceText,
    required this.durationText,
    required this.distanceMeters,
    required this.durationSeconds,
  });
}

String _stripHtml(String html) => html.replaceAll(RegExp(r'<[^>]*>'), '');

/// Fetches the real driving route between two points, the way Uber/Ola/
/// Rapido show it — following actual roads instead of a straight line
/// drawn "as the crow flies" between pickup and drop — plus the turn-by-
/// turn steps needed to drive in-app navigation.
///
/// Returns null (never throws) on any failure — no API key configured, no
/// internet, quota exceeded, zero results, etc. Callers should treat null
/// as "fall back to the straight line", not as an error to surface to the
/// driver; a road route is a nice-to-have, not something worth blocking
/// the map on.
class DirectionsService {
  static Future<RouteResult?> fetchRoute({
    required LatLng origin,
    required LatLng destination,
  }) async {
    final apiKey = MapsConfig.directionsApiKey;
    if (apiKey.isEmpty) return null;

    final uri = Uri.https('maps.googleapis.com', '/maps/api/directions/json', {
      'origin': '${origin.latitude},${origin.longitude}',
      'destination': '${destination.latitude},${destination.longitude}',
      'mode': 'driving',
      'key': apiKey,
    });

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) {
        debugPrint(
            'DirectionsService: HTTP ${response.statusCode} for '
            '${origin.latitude},${origin.longitude} -> '
            '${destination.latitude},${destination.longitude}');
        return null;
      }

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['status'] != 'OK') {
        // Google always tells you exactly why in `status` (REQUEST_DENIED,
        // ZERO_RESULTS, OVER_QUERY_LIMIT, INVALID_REQUEST, ...) plus a
        // human-readable `error_message` for most of those — print both so
        // a failed route shows up in the logs instead of just vanishing.
        debugPrint(
            'DirectionsService: status=${data['status']} '
            'error_message=${data['error_message']} for '
            '${origin.latitude},${origin.longitude} -> '
            '${destination.latitude},${destination.longitude}');
        return null;
      }

      final routes = data['routes'] as List?;
      if (routes == null || routes.isEmpty) return null;
      final route = routes.first as Map<String, dynamic>;

      final overview = route['overview_polyline'] as Map<String, dynamic>?;
      final encoded = overview?['points'] as String?;
      if (encoded == null || encoded.isEmpty) return null;

      final legs = route['legs'] as List?;
      final leg = (legs != null && legs.isNotEmpty) ? legs.first as Map<String, dynamic> : null;

      final rawSteps = leg?['steps'] as List? ?? const [];
      final steps = rawSteps.map((s) {
        final step = s as Map<String, dynamic>;
        final startLoc = step['start_location'] as Map<String, dynamic>;
        final endLoc = step['end_location'] as Map<String, dynamic>;
        return RouteStep(
          instruction: _stripHtml((step['html_instructions'] as String?) ?? ''),
          maneuver: (step['maneuver'] as String?) ?? '',
          distanceMeters: ((step['distance']?['value'] as num?) ?? 0).toDouble(),
          distanceText: (step['distance']?['text'] as String?) ?? '',
          startLocation: LatLng((startLoc['lat'] as num).toDouble(), (startLoc['lng'] as num).toDouble()),
          endLocation: LatLng((endLoc['lat'] as num).toDouble(), (endLoc['lng'] as num).toDouble()),
        );
      }).toList();

      return RouteResult(
        points: decodePolyline(encoded),
        steps: steps,
        distanceText: (leg?['distance']?['text'] as String?) ?? '',
        durationText: (leg?['duration']?['text'] as String?) ?? '',
        distanceMeters: ((leg?['distance']?['value'] as num?) ?? 0).toDouble(),
        durationSeconds: ((leg?['duration']?['value'] as num?) ?? 0).toDouble(),
      );
    } catch (e) {
      debugPrint('DirectionsService: request failed: $e');
      return null;
    }
  }
}
