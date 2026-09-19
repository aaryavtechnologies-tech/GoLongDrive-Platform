// lib/core/theme/theme_controller.dart
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Holds the app's current theme mode. Default is light (the refreshed
/// look). `ProfileScreen` is the only place that calls [toggle] right now.
///
/// This is a plain ChangeNotifier rather than persisted state — the choice
/// resets to light on app restart. Wire SharedPreferences here (read on
/// construction, write in [toggle]) once persistence is wanted.
class ThemeController extends ChangeNotifier {
  static const _preferenceKey = 'rider_dark_mode';
  bool _isDark = false;
  bool get isDark => _isDark;

  ThemeController() {
    _restore();
  }

  Future<void> _restore() async {
    final preferences = await SharedPreferences.getInstance();
    final stored = preferences.getBool(_preferenceKey);
    if (stored == null || stored == _isDark) return;
    _isDark = stored;
    notifyListeners();
  }

  Future<void> toggle() async {
    _isDark = !_isDark;
    notifyListeners();
    final preferences = await SharedPreferences.getInstance();
    await preferences.setBool(_preferenceKey, _isDark);
  }
}
