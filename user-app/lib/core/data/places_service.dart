import 'dart:convert';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'api_client.dart';

class PlaceSuggestion {
  final String placeId;
  final String mainText;
  final String secondaryText;

  const PlaceSuggestion({
    required this.placeId,
    required this.mainText,
    required this.secondaryText,
  });

  String get fullText =>
      secondaryText.isEmpty ? mainText : '$mainText, $secondaryText';
}

/// A resolved place — an autocomplete suggestion turned into real
/// coordinates via Place Details, or a reverse-geocoded device position.
class ResolvedPlace {
  final String address;
  final LatLng latLng;

  const ResolvedPlace({required this.address, required this.latLng});
}

/// Wraps the Google Places Autocomplete + Place Details APIs (destination
/// search) and the Geocoding API (turning the rider's GPS fix into a
/// readable "pickup" address).
class PlacesService {
  /// Debounced by the caller (the search screen), not here — this fires
  /// one request per call.
  static Future<List<PlaceSuggestion>> autocomplete(String input) async {
    if (input.trim().isEmpty) return const [];

    final endpoint = '/maps/autocomplete?input=${Uri.encodeComponent(input)}';

    try {
      final response = await ApiClient.get(endpoint);
      if (response.statusCode != 200) {
        return const [];
      }
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;
      final suggestions = data?['suggestions'] as List? ?? const [];
      return suggestions.map((p) {
        final item = p as Map<String, dynamic>;
        return PlaceSuggestion(
          placeId: item['placeId'] as String? ?? '',
          mainText: item['mainText'] as String? ?? '',
          secondaryText: item['secondaryText'] as String? ?? '',
        );
      }).where((s) => s.placeId.isNotEmpty).toList();
    } catch (e) {
      return const [];
    }
  }

  static Future<ResolvedPlace?> placeDetails(String placeId) async {
    if (placeId.isEmpty) return null;

    final endpoint = '/maps/details?placeId=${Uri.encodeComponent(placeId)}';

    try {
      final response = await ApiClient.get(endpoint);
      if (response.statusCode != 200) {
        return null;
      }
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final result = body['data'] as Map<String, dynamic>?;
      if (result == null || result['lat'] == null || result['lng'] == null) return null;
      return ResolvedPlace(
        address: result['address'] as String? ?? '',
        latLng: LatLng((result['lat'] as num).toDouble(), (result['lng'] as num).toDouble()),
      );
    } catch (e) {
      return null;
    }
  }

  /// Turns a raw GPS fix into a human-readable address for the pickup field
  /// (e.g. "MG Road, Bengaluru" instead of raw coordinates).
  static Future<String?> reverseGeocode(LatLng latLng) async {
    final endpoint = '/maps/reverse-geocode?lat=${latLng.latitude}&lng=${latLng.longitude}';

    try {
      final response = await ApiClient.get(endpoint);
      if (response.statusCode != 200) return null;
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;
      if (data == null || data['address'] == null) return null;
      return data['address'] as String;
    } catch (e) {
      return null;
    }
  }
}
