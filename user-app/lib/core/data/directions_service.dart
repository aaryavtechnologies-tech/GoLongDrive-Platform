import 'dart:convert';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../utils/polyline_decoder.dart';
import 'api_client.dart';

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
class DirectionsService {
  static Future<RouteResult?> fetchRoute({
    required LatLng origin,
    required LatLng destination,
  }) async {
    try {
      final response = await ApiClient.post(
        '/maps/route',
        body: {
          'originLat': origin.latitude,
          'originLng': origin.longitude,
          'destinationLat': destination.latitude,
          'destinationLng': destination.longitude,
        },
      );

      if (response.statusCode != 200) {
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
      return null;
    }
  }
}
