import 'package:flutter/material.dart';
import 'auth_service.dart';

class UserController extends ChangeNotifier {
  Map<String, dynamic>? _userProfile;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get userProfile => _userProfile;
  bool get isLoading => _isLoading;
  String? get error => _error;

  bool get isLoggedIn => _userProfile != null;

  Future<void> fetchProfile() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final profile = await AuthService.getUserProfile();
      _userProfile = profile;
    } catch (e) {
      _error = e.toString();
      _userProfile = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await AuthService.logout();
    _userProfile = null;
    _error = null;
    notifyListeners();
  }

  void setProfile(Map<String, dynamic> profile) {
    _userProfile = profile;
    _error = null;
    notifyListeners();
  }

  void clearProfile() {
    _userProfile = null;
    _error = null;
    notifyListeners();
  }
}
