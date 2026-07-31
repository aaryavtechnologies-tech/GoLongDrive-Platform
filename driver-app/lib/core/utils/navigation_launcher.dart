import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

/// Starts real turn-by-turn navigation to [destination] in the device's
/// native maps app — this is what Uber/Ola/Rapido's driver apps actually
/// do; none of them render their own turn-by-turn engine in-app, they hand
/// off to Google Maps (Android) / Apple or Google Maps (iOS) which already
/// has live traffic, voice guidance and rerouting.
///
/// Tries, in order, until one is launchable:
///   1. Android: the `google.navigation:` intent — this is the one that
///      drops the driver straight into turn-by-turn mode (not just a
///      route preview).
///   2. iOS: the Google Maps app (`comgooglemaps://`) if installed.
///   3. iOS: Apple Maps (`maps://`).
///   4. Any platform: the Google Maps web URL, as a universal fallback —
///      opens the Google Maps app if installed, otherwise the browser.
class NavigationLauncher {
  static Future<bool> start({
    required LatLng destination,
    String? label,
  }) async {
    final lat = destination.latitude;
    final lng = destination.longitude;

    final candidates = <Uri>[];

    if (!kIsWeb && Platform.isAndroid) {
      candidates.add(Uri.parse('google.navigation:q=$lat,$lng&mode=d'));
    }

    if (!kIsWeb && Platform.isIOS) {
      candidates.add(Uri.parse('comgooglemaps://?daddr=$lat,$lng&directionsmode=driving'));
      candidates.add(Uri.parse('maps://?daddr=$lat,$lng&dirflg=d'));
    }

    candidates.add(Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving&dir_action=navigate',
    ));

    for (final uri in candidates) {
      if (await canLaunchUrl(uri)) {
        return launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
    return false;
  }
}
