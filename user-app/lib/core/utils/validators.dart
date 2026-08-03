// lib/core/utils/validators.dart

/// All local form-validation rules used across auth screens. UI-only —
/// no backend calls. Every screen must reuse these instead of writing
/// inline regex.
class Validators {
  Validators._();

  static final RegExp _emailRegex =
  RegExp(r'^[\w\.\-]+@([\w\-]+\.)+[\w\-]{2,4}$');

  static final RegExp _mobileRegex = RegExp(r'^[0-9]{10}$');

  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  static final RegExp _passwordRegex =
  RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$');

  static final RegExp _otpRegex = RegExp(r'^[0-9]{6}$');

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Email is required';
    }
    if (!_emailRegex.hasMatch(value.trim())) {
      return 'Enter a valid email address';
    }
    return null;
  }

  static String? mobile(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Mobile number is required';
    }
    if (!_mobileRegex.hasMatch(value.trim())) {
      return 'Enter a valid 10-digit mobile number';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (!_passwordRegex.hasMatch(value)) {
      return '8+ chars, with uppercase, lowercase, number & special character';
    }
    return null;
  }

  /// For the "Login" screen, where we only need presence-checking,
  /// not full strength validation (that only applies at registration).
  static String? passwordRequired(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    return null;
  }

  static String? confirmPassword(String? value, String originalPassword) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }
    if (value != originalPassword) {
      return 'Passwords do not match';
    }
    return null;
  }

  static String? otp(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'OTP is required';
    }
    if (!_otpRegex.hasMatch(value.trim())) {
      return 'Enter the 6-digit OTP';
    }
    return null;
  }

  static String? fullName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Full name is required';
    }
    if (value.trim().length < 2) {
      return 'Enter your full name';
    }
    return null;
  }

  /// Simple 0-4 password strength score, used for the live strength
  /// indicator on the Register screen. Not used for validation itself.
  static int passwordStrength(String value) {
    int score = 0;
    if (value.length >= 8) score++;
    if (RegExp(r'[A-Z]').hasMatch(value)) score++;
    if (RegExp(r'[a-z]').hasMatch(value) && RegExp(r'\d').hasMatch(value)) score++;
    if (RegExp(r'[!@#$%^&*(),.?":{}|<>_\-]').hasMatch(value)) score++;
    return score;
  }
}