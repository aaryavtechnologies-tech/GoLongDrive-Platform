import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../data/api_client.dart';

class AuthService {
  static const String baseUrl = ApiClient.baseUrl;
  static const String _tokenKey = 'auth_token';

  /// Saves the token to local storage
  static Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  /// Retrieves the stored token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  /// Clears the stored token
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  /// Extracts error message from response or generic text
  static String _extractErrorMessage(http.Response response) {
    try {
      final body = jsonDecode(response.body);
      if (body is Map<String, dynamic>) {
        if (body['message'] != null && body['message'].toString().isNotEmpty) {
          return body['message'].toString();
        }
        if (body['error'] != null && body['error'].toString().isNotEmpty) {
          return body['error'].toString();
        }
        if (body['errors'] != null) {
          if (body['errors'] is List && (body['errors'] as List).isNotEmpty) {
            final firstErr = (body['errors'] as List).first;
            if (firstErr is Map && firstErr['msg'] != null) {
              return firstErr['msg'].toString();
            }
            return firstErr.toString();
          }
          return body['errors'].toString();
        }
      }
      return 'Request failed with status ${response.statusCode}';
    } catch (_) {
      return 'Server error (${response.statusCode})';
    }
  }

  /// Get the current user's profile
  static Future<Map<String, dynamic>> getUserProfile() async {
    final response = await ApiClient.get('/customer/profile');
    
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final data = body['data'] ?? body;
      if (data is Map<String, dynamic>) {
        if (data['customer'] != null && data['customer'] is Map) {
          return Map<String, dynamic>.from(data['customer']);
        }
        return Map<String, dynamic>.from(data);
      }
      return {};
    } else {
      final errorMsg = _extractErrorMessage(response);
      throw Exception(errorMsg);
    }
  }

  /// Login a user
  static Future<void> login(String email, String password) async {
    final response = await ApiClient.post('/customer/login', body: {
      'email': email,
      'password': password,
    });
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      final body = jsonDecode(response.body);
      if (body['data'] != null && body['data']['accessToken'] != null) {
        await _saveToken(body['data']['accessToken']);
      } else if (body['accessToken'] != null) {
        await _saveToken(body['accessToken']);
      }
    } else {
      final errorMsg = _extractErrorMessage(response);
      throw Exception(errorMsg);
    }
  }

  /// Register a new user
  static Future<void> register(String fullName, String email, String phoneNumber, String password) async {
    final response = await ApiClient.post('/customer/register', body: {
      'fullName': fullName,
      'email': email,
      'phoneNumber': phoneNumber,
      'password': password,
    });

    if (response.statusCode == 200 || response.statusCode == 201) {
      final body = jsonDecode(response.body);
      if (body['data'] != null && body['data']['accessToken'] != null) {
        await _saveToken(body['data']['accessToken']);
      } else if (body['accessToken'] != null) {
        await _saveToken(body['accessToken']);
      }
    } else {
      final errorMsg = _extractErrorMessage(response);
      throw Exception(errorMsg);
    }
  }

  /// Update user profile
  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await ApiClient.put('/customer/profile', body: data);

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final resData = body['data'] ?? body;
      if (resData is Map<String, dynamic>) {
        if (resData['customer'] != null && resData['customer'] is Map) {
          return Map<String, dynamic>.from(resData['customer']);
        }
        return Map<String, dynamic>.from(resData);
      }
      return {};
    } else {
      final errorMsg = _extractErrorMessage(response);
      throw Exception(errorMsg);
    }
  }

  /// Send OTP (requires auth token)
  static Future<void> sendOtp() async {
    final response = await ApiClient.post('/customer/send-otp');
    
    if (response.statusCode != 200 && response.statusCode != 201) {
      final errorMsg = _extractErrorMessage(response);
      throw Exception(errorMsg);
    }
  }

  /// Verify OTP (requires auth token)
  static Future<void> verifyOtp(String otp) async {
    final response = await ApiClient.post('/customer/verify-otp', body: {'otp': otp});

    if (response.statusCode != 200 && response.statusCode != 201) {
      final errorMsg = _extractErrorMessage(response);
      throw Exception(errorMsg);
    }
  }
}
