// lib/core/theme/theme_controller.dart
import 'package:flutter/foundation.dart';

/// Holds the app's current theme mode. Default is dark (the app's original
/// look). `ProfileScreen` is the only place that calls [toggle] right now.
///
/// This is a plain ChangeNotifier rather than persisted state — the choice
/// resets to dark on app restart. Wire SharedPreferences here (read on
/// construction, write in [toggle]) once persistence is wanted.
class ThemeController extends ChangeNotifier {
  bool _isDark = true;
  bool get isDark => _isDark;

  void toggle() {
    _isDark = !_isDark;
    notifyListeners();
  }
}
