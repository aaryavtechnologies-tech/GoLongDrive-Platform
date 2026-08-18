// lib/core/data/directions_service.dart
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:google_maps_flutter/google_maps_flutter.dart';
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
  static const String baseUrl = 'https://api.golongdrive.online/api/v1';

  static Future<RouteResult?> fetchRoute({
    required LatLng origin,
    required LatLng destination,
  }) async {
    final url = Uri.parse('$baseUrl/maps/route');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'originLat': origin.latitude,
          'originLng': origin.longitude,
          'destinationLat': destination.latitude,
          'destinationLng': destination.longitude,
        }),
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode != 200) {
        debugPrint('DirectionsService: HTTP ${response.statusCode}');
        return null;
      }

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;
      if (data == null) return null;

      final encoded = data['polyline'] as String?;
      if (encoded == null || encoded.isEmpty) return null;

      return RouteResult(
        points: decodePolyline(encoded),
        distanceText: (data['distanceText'] as String?) ?? '',
        durationText: (data['durationText'] as String?) ?? '',
        distanceMeters: ((data['distanceValueKm'] as num? ?? 0) * 1000.0).toDouble(),
        durationSeconds: ((data['durationValueSec'] as num?) ?? 0).toDouble(),
      );
    } catch (e) {
      debugPrint('DirectionsService: request failed: $e');
      return null;
    }
  }
}
