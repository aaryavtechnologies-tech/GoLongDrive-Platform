import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';

class MapsLauncherUtil {
  MapsLauncherUtil._();

  /// Launches Google Maps navigation to [destLat], [destLng].
  /// If [originLat] and [originLng] are provided, it sets up turn-by-turn
  /// driving directions from origin to destination.
  static Future<bool> launchNavigation({
    required double destLat,
    required double destLng,
    double? originLat,
    double? originLng,
    String? destinationLabel,
  }) async {
    // Primary: Google Maps universal web / deep-link URL (works on Android, iOS, web)
    final originParam = (originLat != null && originLng != null)
        ? '&origin=$originLat,$originLng'
        : '';
    final encodedLabel = destinationLabel != null
        ? Uri.encodeComponent(destinationLabel)
        : '$destLat,$destLng';

    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1$originParam&destination=$destLat,$destLng&travelmode=driving',
    );

    try {
      if (await canLaunchUrl(uri)) {
        return await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
      }
      
      // Fallback: geo uri for Android
      final geoUri = Uri.parse('geo:$destLat,$destLng?q=$destLat,$destLng($encodedLabel)');
      if (await canLaunchUrl(geoUri)) {
        return await launchUrl(
          geoUri,
          mode: LaunchMode.externalApplication,
        );
      }
    } catch (e) {
      debugPrint('MapsLauncherUtil error launching maps: $e');
    }
    return false;
  }
}
