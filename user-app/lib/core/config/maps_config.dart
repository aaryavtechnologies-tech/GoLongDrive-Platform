// lib/core/config/maps_config.dart
library;

import 'package:flutter_dotenv/flutter_dotenv.dart';

class MapsConfig {
  static String get directionsApiKey {
    try {
      if (dotenv.isInitialized) {
        return dotenv.env['DIRECTIONS_API_KEY'] ??
            const String.fromEnvironment(
              'DIRECTIONS_API_KEY',
              defaultValue: '',
            );
      }
    } catch (_) {}
    return const String.fromEnvironment(
      'DIRECTIONS_API_KEY',
      defaultValue: '',
    );
  }
}
