// lib/core/data/directions_service.dart
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../config/maps_config.dart';
import '../utils/polyline_decoder.dart';

/// Result of a Directions API lookup: the actual road-following path plus
/// the real drive distance/duration (as opposed to a crude straight-line
/// estimate).
class RouteResult {
  final List<LatLng> points;
  final String distanceText;
  final String durationText;
  final double distanceMeters;
  final double durationSeconds;

  const RouteResult({
    required this.points,
    required this.distanceText,
    required this.durationText,
    required this.distanceMeters,
    required this.durationSeconds,
  });
}

/// Fetches the real driving route between two points, following actual
/// roads instead of a straight line "as the crow flies".
///
/// Returns null (never throws) on any failure — no API key configured, no
/// internet, quota exceeded, zero results, etc. Callers should treat null
/// as "fall back to the straight line", not as an error to surface to the
/// rider; a road route is a nice-to-have, not something worth blocking the
/// map on. Every failure is still logged via [debugPrint] with Google's
/// actual status/error_message so it's diagnosable from the console instead
/// of silently vanishing.
class DirectionsService {
  static Future<RouteResult?> fetchRoute({
    required LatLng origin,
    required LatLng destination,
  }) async {
    final apiKey = MapsConfig.directionsApiKey;
    if (apiKey.isEmpty) {
      debugPrint('DirectionsService: DIRECTIONS_API_KEY is empty — pass '
          '--dart-define=DIRECTIONS_API_KEY=your_key_here');
      return null;
    }

    final uri = Uri.https('maps.googleapis.com', '/maps/api/directions/json', {
      'origin': '${origin.latitude},${origin.longitude}',
      'destination': '${destination.latitude},${destination.longitude}',
      'mode': 'driving',
      'key': apiKey,
    });

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) {
        debugPrint('DirectionsService: HTTP ${response.statusCode}');
        return null;
      }

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['status'] != 'OK') {
        debugPrint('DirectionsService: status=${data['status']} '
            'error_message=${data['error_message']}');
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

      return RouteResult(
        points: decodePolyline(encoded),
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
