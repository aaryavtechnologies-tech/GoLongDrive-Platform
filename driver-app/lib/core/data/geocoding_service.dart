import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../config/maps_config.dart';
import '../models/ride.dart';

/// Result of a geocoding lookup: the coordinates Google resolved for the
/// address, plus the formatted address it matched — useful for sanity
/// checking that the text and the numbers actually agree.
class GeocodeResult {
  final LatLng location;
  final String formattedAddress;

  const GeocodeResult({required this.location, required this.formattedAddress});
}

/// Turns a free-text address ("Jalandhar Bus Stand") into lat/lng using the
/// Google Geocoding API.
///
/// WHAT THIS FIXES: a ride that arrives with `pickupLat`/`pickupLng` (or
/// drop equivalents) missing entirely — instead of falling back to the
/// "no map available" placeholder forever, the address text gets geocoded
/// and used instead.
///
/// WHAT THIS DOES **NOT** FIX: a ride whose coordinates are simply wrong —
/// e.g. `pickupAddress` says "Jalandhar" but `pickupLat`/`pickupLng` are
/// numbers that point at Silvassa. This service is never called in that
/// case, because the ride already "has" coordinates (`hasRouteCoordinates`
/// is true) — the app has no way to know those numbers are wrong, and every
/// map/navigation call in this app (the small preview map, the fullscreen
/// map, in-app turn-by-turn, "Open in Google Maps") uses exactly those
/// numbers, nothing else. That kind of mismatch can only be fixed where the
/// ride data is produced (backend / whatever populates `Ride`). To make a
/// mismatch like that obvious immediately instead of silently, the
/// fullscreen map card now shows the raw pickup/drop coordinates on-screen
/// next to the address text — see `_CoordinateDebugStrip` in
/// `ride_route_map.dart`.
class GeocodingService {
  static Future<GeocodeResult?> geocode(String address) async {
    final apiKey = MapsConfig.directionsApiKey;
    if (apiKey.isEmpty || address.trim().isEmpty) return null;

    final uri = Uri.https('maps.googleapis.com', '/maps/api/geocode/json', {
      'address': address,
      'key': apiKey,
    });

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) return null;

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['status'] != 'OK') return null;

      final results = data['results'] as List?;
      if (results == null || results.isEmpty) return null;
      final result = results.first as Map<String, dynamic>;

      final loc = result['geometry']?['location'] as Map<String, dynamic>?;
      if (loc == null) return null;

      return GeocodeResult(
        location: LatLng((loc['lat'] as num).toDouble(), (loc['lng'] as num).toDouble()),
        formattedAddress: (result['formatted_address'] as String?) ?? address,
      );
    } catch (_) {
      return null;
    }
  }

  /// Returns [ride] unchanged if it already has coordinates. Otherwise
  /// geocodes `pickupAddress`/`dropAddress` and returns a copy of [ride]
  /// with those resolved coordinates filled in (`isGeocoded: true`).
  /// Returns null only if coordinates are missing AND geocoding failed for
  /// either address (no API key configured, no network, address not
  /// found, etc.) — callers should treat that as "no route available for
  /// this ride" rather than crash or show a stale/wrong location.
  static Future<Ride?> geocodeRide(Ride ride) async {
    if (ride.hasRouteCoordinates) return ride;

    final pickup = await geocode(ride.pickupAddress);
    final drop = await geocode(ride.dropAddress);
    if (pickup == null || drop == null) return null;

    return ride.withCoordinates(
      pickupLat: pickup.location.latitude,
      pickupLng: pickup.location.longitude,
      dropLat: drop.location.latitude,
      dropLng: drop.location.longitude,
    );
  }
}
