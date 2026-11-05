import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String _tokenKey = 'driver_auth_token';
  static const String _userIdKey = 'driver_id';
  static const String _seenOnboardingKey = 'driver_seen_onboarding';
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();
  
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    try {
      await _secureStorage.write(key: _tokenKey, value: token);
    } catch (_) {}
  }

  static Future<void> saveUserId(String? userId) async {
    if (userId == null || userId.isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userIdKey, userId);
    try {
      await _secureStorage.write(key: _userIdKey, value: userId);
    } catch (_) {}
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString(_tokenKey);
    if (token != null && token.isNotEmpty) return token;

    try {
      token = await _secureStorage.read(key: _tokenKey);
      if (token != null && token.isNotEmpty) {
        await prefs.setString(_tokenKey, token);
        return token;
      }
    } catch (_) {}
    return null;
  }
  
  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    String? userId = prefs.getString(_userIdKey);
    if (userId != null && userId.isNotEmpty) return userId;

    try {
      userId = await _secureStorage.read(key: _userIdKey);
      if (userId != null && userId.isNotEmpty) {
        await prefs.setString(_userIdKey, userId);
        return userId;
      }
    } catch (_) {}
    return null;
  }

  static Future<void> markOnboardingSeen() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_seenOnboardingKey, true);
  }

  static Future<bool> hasSeenOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_seenOnboardingKey) ?? false;
  }

  static Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userIdKey);
    try {
      await _secureStorage.delete(key: _tokenKey);
      await _secureStorage.delete(key: _userIdKey);
    } catch (_) {}
  }

  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
