// lib/core/data/places_service.dart
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:google_maps_flutter/google_maps_flutter.dart';
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
/// readable "pickup" address). Every method returns null/empty on failure
/// rather than throwing — search should degrade quietly, not crash the
/// screen — but failures are logged via [debugPrint] so they're
/// diagnosable instead of silently vanishing.
class PlacesService {
  static const String baseUrl = 'https://api.golongdrive.online/api/v1';

  /// Debounced by the caller (the search screen), not here — this fires
  /// one request per call.
  static Future<List<PlaceSuggestion>> autocomplete(String input) async {
    if (input.trim().isEmpty) return const [];

    final uri = Uri.parse('$baseUrl/maps/autocomplete?input=${Uri.encodeComponent(input)}');

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) {
        debugPrint('PlacesService.autocomplete: HTTP ${response.statusCode}');
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
      debugPrint('PlacesService.autocomplete: request failed: $e');
      return const [];
    }
  }

  static Future<ResolvedPlace?> placeDetails(String placeId) async {
    if (placeId.isEmpty) return null;

    final uri = Uri.parse('$baseUrl/maps/details?placeId=${Uri.encodeComponent(placeId)}');

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) {
        debugPrint('PlacesService.placeDetails: HTTP ${response.statusCode}');
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
      debugPrint('PlacesService.placeDetails: request failed: $e');
      return null;
    }
  }

  /// Turns a raw GPS fix into a human-readable address for the pickup field
  /// (e.g. "MG Road, Bengaluru" instead of raw coordinates).
  static Future<String?> reverseGeocode(LatLng latLng) async {
    final uri = Uri.parse('$baseUrl/maps/reverse-geocode?lat=${latLng.latitude}&lng=${latLng.longitude}');

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) return null;
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;
      if (data == null || data['address'] == null) return null;
      return data['address'] as String;
    } catch (e) {
      debugPrint('PlacesService.reverseGeocode: request failed: $e');
      return null;
    }
  }
}
