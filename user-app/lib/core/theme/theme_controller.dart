// lib/core/theme/theme_controller.dart
import 'package:flutter/foundation.dart';

/// Legacy ThemeController retained for backwards compatibility.
/// Dark mode has been completely removed from the User App.
/// isDark is permanently false, and toggle() is a safe no-op.
class ThemeController extends ChangeNotifier {
  bool get isDark => false;

  ThemeController();

  Future<void> toggle() async {
    // Dark mode is permanently disabled for the User App.
  }
}
