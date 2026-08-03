// lib/core/data/places_service.dart
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../config/maps_config.dart';

/// One row in the destination-search suggestion list.
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
  /// Debounced by the caller (the search screen), not here — this fires
  /// one request per call.
  static Future<List<PlaceSuggestion>> autocomplete(String input) async {
    final apiKey = MapsConfig.directionsApiKey;
    if (apiKey.isEmpty || input.trim().isEmpty) return const [];

    final uri = Uri.https(
      'maps.googleapis.com',
      '/maps/api/place/autocomplete/json',
      {
        'input': input,
        'key': apiKey,
        // Bias toward India-style driving trips; harmless if the rider is
        // elsewhere since it's a bias, not a hard filter.
        'components': 'country:in',
      },
    );

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) {
        debugPrint('PlacesService.autocomplete: HTTP ${response.statusCode}');
        return const [];
      }
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['status'] != 'OK') {
        if (data['status'] != 'ZERO_RESULTS') {
          debugPrint('PlacesService.autocomplete: status=${data['status']} '
              'error_message=${data['error_message']}');
        }
        return const [];
      }
      final predictions = data['predictions'] as List? ?? const [];
      return predictions.map((p) {
        final item = p as Map<String, dynamic>;
        final structured = item['structured_formatting'] as Map<String, dynamic>?;
        return PlaceSuggestion(
          placeId: item['place_id'] as String? ?? '',
          mainText: structured?['main_text'] as String? ?? (item['description'] as String? ?? ''),
          secondaryText: structured?['secondary_text'] as String? ?? '',
        );
      }).where((s) => s.placeId.isNotEmpty).toList();
    } catch (e) {
      debugPrint('PlacesService.autocomplete: request failed: $e');
      return const [];
    }
  }

  static Future<ResolvedPlace?> placeDetails(String placeId) async {
    final apiKey = MapsConfig.directionsApiKey;
    if (apiKey.isEmpty) return null;

    final uri = Uri.https('maps.googleapis.com', '/maps/api/place/details/json', {
      'place_id': placeId,
      'fields': 'formatted_address,geometry',
      'key': apiKey,
    });

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) {
        debugPrint('PlacesService.placeDetails: HTTP ${response.statusCode}');
        return null;
      }
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['status'] != 'OK') {
        debugPrint('PlacesService.placeDetails: status=${data['status']} '
            'error_message=${data['error_message']}');
        return null;
      }
      final result = data['result'] as Map<String, dynamic>?;
      final location = result?['geometry']?['location'] as Map<String, dynamic>?;
      if (result == null || location == null) return null;
      return ResolvedPlace(
        address: result['formatted_address'] as String? ?? '',
        latLng: LatLng((location['lat'] as num).toDouble(), (location['lng'] as num).toDouble()),
      );
    } catch (e) {
      debugPrint('PlacesService.placeDetails: request failed: $e');
      return null;
    }
  }

  /// Turns a raw GPS fix into a human-readable address for the pickup field
  /// (e.g. "MG Road, Bengaluru" instead of raw coordinates).
  static Future<String?> reverseGeocode(LatLng latLng) async {
    final apiKey = MapsConfig.directionsApiKey;
    if (apiKey.isEmpty) return null;

    final uri = Uri.https('maps.googleapis.com', '/maps/api/geocode/json', {
      'latlng': '${latLng.latitude},${latLng.longitude}',
      'key': apiKey,
    });

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) return null;
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['status'] != 'OK') {
        debugPrint('PlacesService.reverseGeocode: status=${data['status']}');
        return null;
      }
      final results = data['results'] as List?;
      if (results == null || results.isEmpty) return null;
      return (results.first as Map<String, dynamic>)['formatted_address'] as String?;
    } catch (e) {
      debugPrint('PlacesService.reverseGeocode: request failed: $e');
      return null;
    }
  }
}
