import 'dart:async';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/api_client.dart';
import 'socket_service.dart';

class BookingService {
  static String get baseUrl => ApiClient.baseUrl;

  static const String _dismissedRidesKey = 'dismissed_or_cancelled_booking_ids';

  /// In-memory cache of cancelled booking IDs to instantly suppress active ride displays
  static final Set<String> _cancelledBookingIds = <String>{};

  /// Broadcast stream to notify UI immediately when a booking is cancelled
  static final StreamController<String> _localBookingCancelledCtrl =
      StreamController<String>.broadcast();
  static Stream<String> get onLocalBookingCancelled =>
      _localBookingCancelledCtrl.stream;

  /// Mark a booking as cancelled or dismissed locally and persistently
  static Future<void> markBookingCancelled(String bookingId) async {
    final id = bookingId.trim();
    if (id.isNotEmpty) {
      _cancelledBookingIds.add(id);
      _localBookingCancelledCtrl.add(id);
      UserSocketService.notifyRideCancelled(id);
      try {
        final prefs = await SharedPreferences.getInstance();
        final list = prefs.getStringList(_dismissedRidesKey) ?? [];
        if (!list.contains(id)) {
          list.add(id);
          await prefs.setStringList(_dismissedRidesKey, list);
        }
      } catch (_) {}
    }
  }

  /// Check whether a booking was marked cancelled locally (sync)
  static bool isBookingCancelled(String? bookingId) {
    if (bookingId == null || bookingId.trim().isEmpty) return false;
    return _cancelledBookingIds.contains(bookingId.trim());
  }

  /// Check whether a booking was marked cancelled or dismissed (async with SharedPreferences)
  static Future<bool> isBookingCancelledAsync(String? bookingId) async {
    if (bookingId == null || bookingId.trim().isEmpty) return false;
    final id = bookingId.trim();
    if (_cancelledBookingIds.contains(id)) return true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_dismissedRidesKey) ?? [];
      if (list.contains(id)) {
        _cancelledBookingIds.add(id);
        return true;
      }
    } catch (_) {}
    return false;
  }

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
        return body['data']['bookings'] ?? [];
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

  /// Fetches current active ride from dedicated active endpoint
  static Future<Map<String, dynamic>?> getCurrentActiveRide() async {
    try {
      final response = await ApiClient.get('/customer/bookings/current/active');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final ride = body['data']?['ride'];
        if (ride != null && ride is Map<String, dynamic>) {
          final bId = (ride['bookingId'] ?? ride['_id'] ?? '').toString();
          if (!isBookingCancelled(bId)) {
            return ride;
          }
        }
      }
    } catch (_) {}
    return null;
  }

  /// Cancels an active booking
  static Future<Map<String, dynamic>> cancelBooking(
    String bookingId, {
    required String reason,
    String? details,
  }) async {
    // Record locally right away to suppress active banner immediately
    markBookingCancelled(bookingId);

    try {
      final payload = {
        'reason': reason,
        if (details != null && details.trim().isNotEmpty) 'details': details.trim(),
      };
      final response = await ApiClient.post('/customer/bookings/$bookingId/cancel', body: payload);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'] ?? body;
      } else {
        // Fallback to PATCH if POST was not handled
        final patchRes = await ApiClient.patch('/customer/bookings/$bookingId/cancel', body: payload);
        if (patchRes.statusCode == 200) {
          final body = jsonDecode(patchRes.body);
          return body['data'] ?? body;
        }
        final err = jsonDecode(patchRes.body);
        throw Exception(err['message'] ?? 'Failed to cancel booking');
      }
    } catch (e) {
      rethrow;
    }
  }
}
