import 'dart:convert';
import 'dart:developer' as developer;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = 'https://api.golongdrive.online/api/v1';
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
      return body['message'] ?? 'An error occurred';
    } catch (_) {
      return 'Server error (${response.statusCode})';
    }
  }

  /// Get the current user's profile
  static Future<Map<String, dynamic>> getUserProfile() async {
    final token = await getToken();
    if (token == null) throw Exception('No authentication token found');

    final url = Uri.parse('$baseUrl/customer/profile');
    developer.log('>>> API REQUEST: GET $url', name: 'AuthService');
    
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    
    developer.log('<<< API RESPONSE: ${response.statusCode}', name: 'AuthService');
    
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      return body['data'] ?? body;
    } else {
      final errorMsg = _extractErrorMessage(response);
      developer.log('getUserProfile failed: $errorMsg', name: 'AuthService');
      throw Exception(errorMsg);
    }
  }

  /// Login a user
  static Future<void> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/customer/login');
    final payload = jsonEncode({'email': email, 'password': password});
    
    developer.log('>>> API REQUEST: POST $url', name: 'AuthService');
    developer.log('>>> PAYLOAD: $payload', name: 'AuthService');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: payload,
    );
    
    developer.log('<<< API RESPONSE: ${response.statusCode}', name: 'AuthService');
    developer.log('<<< BODY: ${response.body}', name: 'AuthService');

    if (response.statusCode == 200 || response.statusCode == 201) {
      final body = jsonDecode(response.body);
      if (body['data'] != null && body['data']['accessToken'] != null) {
        await _saveToken(body['data']['accessToken']);
      } else if (body['accessToken'] != null) {
        await _saveToken(body['accessToken']);
      }
    } else {
      final errorMsg = _extractErrorMessage(response);
      developer.log('Login failed: $errorMsg', name: 'AuthService', error: errorMsg);
      throw Exception(errorMsg);
    }
  }

  /// Register a new user
  static Future<void> register(String fullName, String email, String phoneNumber, String password) async {
    final url = Uri.parse('$baseUrl/customer/register');
    final payload = jsonEncode({
      'fullName': fullName,
      'email': email,
      'phoneNumber': phoneNumber,
      'password': password,
    });

    developer.log('>>> API REQUEST: POST $url', name: 'AuthService');
    developer.log('>>> PAYLOAD: $payload', name: 'AuthService');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: payload,
    );

    developer.log('<<< API RESPONSE: ${response.statusCode}', name: 'AuthService');
    developer.log('<<< BODY: ${response.body}', name: 'AuthService');

    if (response.statusCode == 200 || response.statusCode == 201) {
      final body = jsonDecode(response.body);
      if (body['data'] != null && body['data']['accessToken'] != null) {
        await _saveToken(body['data']['accessToken']);
      } else if (body['accessToken'] != null) {
        await _saveToken(body['accessToken']);
      }
    } else {
      final errorMsg = _extractErrorMessage(response);
      developer.log('Register failed: $errorMsg', name: 'AuthService', error: errorMsg);
      throw Exception(errorMsg);
    }
  }

  /// Send OTP (requires auth token)
  static Future<void> sendOtp() async {
    final token = await getToken();
    if (token == null) {
      developer.log('sendOtp failed: No token found', name: 'AuthService', error: 'No authentication token found');
      throw Exception('No authentication token found');
    }

    final url = Uri.parse('$baseUrl/customer/send-otp');
    developer.log('>>> API REQUEST: POST $url', name: 'AuthService');
    
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    
    developer.log('<<< API RESPONSE: ${response.statusCode}', name: 'AuthService');
    developer.log('<<< BODY: ${response.body}', name: 'AuthService');

    if (response.statusCode != 200 && response.statusCode != 201) {
      final errorMsg = _extractErrorMessage(response);
      developer.log('sendOtp failed: $errorMsg', name: 'AuthService', error: errorMsg);
      throw Exception(errorMsg);
    }
  }

  /// Verify OTP (requires auth token)
  static Future<void> verifyOtp(String otp) async {
    final token = await getToken();
    if (token == null) {
      developer.log('verifyOtp failed: No token found', name: 'AuthService', error: 'No authentication token found');
      throw Exception('No authentication token found');
    }

    final url = Uri.parse('$baseUrl/customer/verify-otp');
    final payload = jsonEncode({'otp': otp});
    
    developer.log('>>> API REQUEST: POST $url', name: 'AuthService');
    developer.log('>>> PAYLOAD: $payload', name: 'AuthService');

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: payload,
    );

    developer.log('<<< API RESPONSE: ${response.statusCode}', name: 'AuthService');
    developer.log('<<< BODY: ${response.body}', name: 'AuthService');

    if (response.statusCode != 200 && response.statusCode != 201) {
      final errorMsg = _extractErrorMessage(response);
      developer.log('verifyOtp failed: $errorMsg', name: 'AuthService', error: errorMsg);
      throw Exception(errorMsg);
    }
  }
}
