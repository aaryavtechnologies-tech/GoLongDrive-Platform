import 'dart:convert';
import 'dart:developer' as developer;
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class BookingService {
  static const String baseUrl = 'https://api.golongdrive.online/api/v1';

  /// Searches for available vehicles based on the route and date/time
  static Future<Map<String, dynamic>> searchVehicles({
    required String from,
    required String to,
    required String date,
    required String time,
  }) async {
    final url = Uri.parse('$baseUrl/customer/vehicles/search?from=${Uri.encodeComponent(from)}&to=${Uri.encodeComponent(to)}&date=${Uri.encodeComponent(date)}&time=${Uri.encodeComponent(time)}');
    developer.log('>>> API REQUEST: GET $url', name: 'BookingService');

    try {
      final token = await AuthService.getToken();
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final response = await http.get(url, headers: headers);
      developer.log('<<< API RESPONSE: ${response.statusCode}', name: 'BookingService');
      
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'];
      } else {
        throw Exception('Failed to search vehicles: ${response.body}');
      }
    } catch (e) {
      developer.log('searchVehicles error: $e', name: 'BookingService');
      rethrow;
    }
  }

  /// Creates a new booking
  static Future<Map<String, dynamic>> createBooking(Map<String, dynamic> payload) async {
    final url = Uri.parse('$baseUrl/customer/bookings');
    developer.log('>>> API REQUEST: POST $url', name: 'BookingService');
    
    try {
      final token = await AuthService.getToken();
      if (token == null) throw Exception('Authentication token missing');

      final headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(payload),
      );

      developer.log('<<< API RESPONSE: ${response.statusCode}', name: 'BookingService');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        return body['data'] ?? body;
      } else {
        throw Exception('Failed to create booking: ${response.body}');
      }
    } catch (e) {
      developer.log('createBooking error: $e', name: 'BookingService');
      rethrow;
    }
  }

  /// Fetches the user's booking history (all)
  static Future<List<dynamic>> getMyBookings() async {
    final url = Uri.parse('$baseUrl/customer/bookings');
    try {
      final token = await AuthService.getToken();
      if (token == null) throw Exception('Authentication token missing');

      final headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'] ?? [];
      } else {
        throw Exception('Failed to get bookings');
      }
    } catch (e) {
      developer.log('getMyBookings error: $e', name: 'BookingService');
      return [];
    }
  }
}
