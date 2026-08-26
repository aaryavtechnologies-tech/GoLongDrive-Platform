import 'dart:convert';
import '../data/api_client.dart';

class BookingService {
  static const String baseUrl = ApiClient.baseUrl;

  /// Searches for available vehicles based on the route and date/time
  static Future<Map<String, dynamic>> searchVehicles({
    required String from,
    required String to,
    required String date,
    required String time,
  }) async {
    final endpoint = '/customer/vehicles/search?from=${Uri.encodeComponent(from)}&to=${Uri.encodeComponent(to)}&date=${Uri.encodeComponent(date)}&time=${Uri.encodeComponent(time)}';

    try {
      final response = await ApiClient.get(endpoint);
      
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'];
      } else {
        throw Exception('Failed to search vehicles: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }

  /// Calculates route distance and travel duration between coordinates
  static Future<Map<String, dynamic>?> getRouteDistance({
    required double originLat,
    required double originLng,
    required double destLat,
    required double destLng,
  }) async {
    try {
      final response = await ApiClient.post('/maps/distance', body: {
        'originLat': originLat,
        'originLng': originLng,
        'destinationLat': destLat,
        'destinationLng': destLng,
      });

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'];
      }
    } catch (_) {}
    return null;
  }

  /// Creates a new booking
  static Future<Map<String, dynamic>> createBooking(Map<String, dynamic> payload) async {
    try {
      final response = await ApiClient.post('/customer/bookings', body: payload);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        return body['data'] ?? body;
      } else {
        throw Exception('Failed to create booking: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }

  /// Fetches the user's booking history (all)
  static Future<List<dynamic>> getMyBookings() async {
    try {
      final response = await ApiClient.get('/customer/bookings');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'] ?? [];
      } else {
        throw Exception('Failed to get bookings');
      }
    } catch (e) {
      return [];
    }
  }

  /// Fetches boarding pass details
  static Future<Map<String, dynamic>> getBoardingPass(String bookingId) async {
    try {
      final response = await ApiClient.get('/rides/$bookingId/boarding-pass');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'];
      } else {
        throw Exception('Failed to get boarding pass: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }

  /// Initiates payment for a booking
  static Future<Map<String, dynamic>> initiatePayment({
    required String bookingId,
    required String paymentMethod,
  }) async {
    try {
      final response = await ApiClient.post('/rides/$bookingId/payment', body: {'paymentMethod': paymentMethod});
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'];
      } else {
        throw Exception('Failed to initiate payment: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }

  /// Verifies a payment signature
  static Future<Map<String, dynamic>> verifyPayment(Map<String, dynamic> payload) async {
    try {
      final response = await ApiClient.post('/payments/verify', body: payload);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'];
      } else {
        throw Exception('Failed to verify payment: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }

  /// Fetches ride/booking details
  static Future<Map<String, dynamic>> getRideDetails(String bookingId) async {
    try {
      final response = await ApiClient.get('/rides/$bookingId');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data']['booking'];
      } else {
        throw Exception('Failed to get ride details: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }
}
