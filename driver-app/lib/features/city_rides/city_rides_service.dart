import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/data/api_service.dart';
import '../../core/data/auth_service.dart';
import 'city_ride_model.dart';

class CityRidesService {
  CityRidesService._();
  static final CityRidesService instance = CityRidesService._();

  final ValueNotifier<List<CityRideRequest>> incomingRequests =
      ValueNotifier([]);
  final ValueNotifier<CityRideRequest?> activeRide = ValueNotifier(null);
  final ValueNotifier<List<CityRideRequest>> completedRides = ValueNotifier([]);

  bool _initialized = false;
  static const String _completedRidesKey = 'golongdrive_completed_city_rides';

  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;
    await _loadCompletedRides();
    await _loadLiveCompletedRides();
    await refreshIncomingRequests();
  }

  /// Adds a socket-delivered city request to the feed. Returns false for
  /// non-city bookings so the dashboard can keep its existing intercity flow.
  bool ingestSocketRequest(Map<String, dynamic> payload) {
    final bookingType = payload['bookingType']?.toString().toLowerCase();
    final tripType = payload['tripType']?.toString().toLowerCase();
    final isExplicitCityRide = bookingType == 'local' ||
        bookingType == 'city' ||
        tripType == 'local' ||
        tripType == 'city';
    if (!isExplicitCityRide) return false;

    final ride = CityRideRequest.fromApiJson(payload);
    if (ride.id.isEmpty) return false;
    final requests = List<CityRideRequest>.from(incomingRequests.value)
      ..removeWhere((request) => request.id == ride.id)
      ..add(ride)
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    incomingRequests.value = requests;
    return true;
  }

  void _populateInitialRequests() {
    final now = DateTime.now();
    incomingRequests.value = [
      CityRideRequest(
        id: 'cr_req_01',
        bookingId: 'CR-8821',
        riderName: 'Priya Sharma',
        riderRating: 4.9,
        riderRidesCount: 42,
        riderPhone: '+91 98251 23456',
        pickupAddress: 'Prahlad Nagar Garden, SG Highway',
        pickupLat: 23.0125,
        pickupLng: 72.5085,
        pickupDistanceKm: 0.9,
        pickupEtaMin: 3,
        dropAddress: 'AlphaOne Mall, Vastrapur Lake',
        dropLat: 23.0410,
        dropLng: 72.5320,
        tripDistanceKm: 4.2,
        tripDurationMin: 14,
        estimatedFare: 165.0,
        paymentMethod: 'UPI',
        ridePin: '4821',
        createdAt: now.subtract(const Duration(seconds: 40)),
      ),
      CityRideRequest(
        id: 'cr_req_02',
        bookingId: 'CR-8822',
        riderName: 'Aarav Patel',
        riderRating: 4.8,
        riderRidesCount: 89,
        riderPhone: '+91 97240 87654',
        pickupAddress: 'Navrangpura Bus Stand, CG Road',
        pickupLat: 23.0360,
        pickupLng: 72.5610,
        pickupDistanceKm: 1.4,
        pickupEtaMin: 5,
        dropAddress: 'Sabarmati Riverfront West, Paldi',
        dropLat: 23.0180,
        dropLng: 72.5710,
        tripDistanceKm: 5.6,
        tripDurationMin: 18,
        estimatedFare: 195.0,
        paymentMethod: 'Cash',
        ridePin: '3159',
        createdAt: now.subtract(const Duration(minutes: 2)),
      ),
      CityRideRequest(
        id: 'cr_req_03',
        bookingId: 'CR-8823',
        riderName: 'Sneha Dave',
        riderRating: 5.0,
        riderRidesCount: 16,
        riderPhone: '+91 99099 11223',
        pickupAddress: 'Law Garden Khau Gali, Ellisbridge',
        pickupLat: 23.0238,
        pickupLng: 72.5564,
        pickupDistanceKm: 2.1,
        pickupEtaMin: 6,
        dropAddress: 'Kalupur Railway Station, Platform 1',
        dropLat: 23.0270,
        dropLng: 72.6010,
        tripDistanceKm: 6.8,
        tripDurationMin: 22,
        estimatedFare: 240.0,
        paymentMethod: 'Cash',
        ridePin: '7724',
        createdAt: now.subtract(const Duration(minutes: 4)),
      ),
      CityRideRequest(
        id: 'cr_req_04',
        bookingId: 'CR-8824',
        riderName: 'Vikram Mehta',
        riderRating: 4.7,
        riderRidesCount: 128,
        riderPhone: '+91 98980 55443',
        pickupAddress: 'Iskcon Cross Roads, SG Highway',
        pickupLat: 23.0275,
        pickupLng: 72.5070,
        pickupDistanceKm: 2.8,
        pickupEtaMin: 8,
        dropAddress: 'Gujarat University Convention Hall',
        dropLat: 23.0378,
        dropLng: 72.5480,
        tripDistanceKm: 5.1,
        tripDurationMin: 16,
        estimatedFare: 180.0,
        paymentMethod: 'UPI',
        ridePin: '9042',
        createdAt: now.subtract(const Duration(minutes: 6)),
      ),
      CityRideRequest(
        id: 'cr_req_05',
        bookingId: 'CR-8825',
        riderName: 'Neha Joshi',
        riderRating: 4.9,
        riderRidesCount: 67,
        riderPhone: '+91 98790 22334',
        pickupAddress: 'Thaltej Metro Station, Thaltej',
        pickupLat: 23.0497,
        pickupLng: 72.5116,
        pickupDistanceKm: 1.1,
        pickupEtaMin: 4,
        dropAddress: 'Science City, Sola',
        dropLat: 23.0808,
        dropLng: 72.4936,
        tripDistanceKm: 5.9,
        tripDurationMin: 19,
        estimatedFare: 215.0,
        paymentMethod: 'UPI',
        ridePin: '6218',
        createdAt: now.subtract(const Duration(minutes: 8)),
      ),
      CityRideRequest(
        id: 'cr_req_06',
        bookingId: 'CR-8826',
        riderName: 'Rohan Shah',
        riderRating: 4.6,
        riderRidesCount: 31,
        riderPhone: '+91 90164 77882',
        pickupAddress: 'Maninagar Railway Station',
        pickupLat: 22.9988,
        pickupLng: 72.6118,
        pickupDistanceKm: 3.2,
        pickupEtaMin: 9,
        dropAddress: 'Kankaria Lake Gate 3',
        dropLat: 23.0063,
        dropLng: 72.6026,
        tripDistanceKm: 3.4,
        tripDurationMin: 12,
        estimatedFare: 145.0,
        paymentMethod: 'Cash',
        ridePin: '5307',
        createdAt: now.subtract(const Duration(minutes: 11)),
      ),
      CityRideRequest(
        id: 'cr_req_07',
        bookingId: 'CR-8827',
        riderName: 'Ishita Desai',
        riderRating: 5.0,
        riderRidesCount: 24,
        riderPhone: '+91 94286 11990',
        pickupAddress: 'Bopal Cross Road, Bopal',
        pickupLat: 23.0330,
        pickupLng: 72.4652,
        pickupDistanceKm: 2.4,
        pickupEtaMin: 7,
        dropAddress: 'Prahlad Nagar Corporate Road',
        dropLat: 23.0120,
        dropLng: 72.5101,
        tripDistanceKm: 6.2,
        tripDurationMin: 21,
        estimatedFare: 230.0,
        paymentMethod: 'UPI',
        ridePin: '1946',
        createdAt: now.subtract(const Duration(minutes: 14)),
      ),
    ];
  }

  Future<void> ignoreRequest(String id) async {
    final list = List<CityRideRequest>.from(incomingRequests.value);
    final request = list.where((ride) => ride.id == id).firstOrNull;
    list.removeWhere((req) => req.id == id);
    incomingRequests.value = list;

    if (request != null && !request.isDemo) {
      try {
        await ApiService.post(
          '/driver/bookings/rides/$id/reject',
          body: {'reason': 'Ignored by driver'},
        );
      } catch (e) {
        debugPrint('Backend reject error (request hidden locally): $e');
      }
    }
  }

  Future<bool> acceptRequest(CityRideRequest request) async {
    try {
      if (!request.isDemo) {
        final response = await ApiService.post(
          '/driver/bookings/rides/${request.id}/accept',
        );
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return false;
        }
      }
    } catch (e) {
      debugPrint('Backend accept error: $e');
      return false;
    }

    final list = List<CityRideRequest>.from(incomingRequests.value)
      ..removeWhere((ride) => ride.id == request.id);
    incomingRequests.value = list;
    activeRide.value = request.copyWith(status: CityRideStatus.accepted);
    return true;
  }

  void markArrivedAtPickup() {
    final current = activeRide.value;
    if (current == null) return;
    activeRide.value = current.copyWith(status: CityRideStatus.arrived);
  }

  Future<bool> verifyPinAndStartRide(String pin) async {
    final current = activeRide.value;
    if (current == null) return false;

    if (current.isDemo && pin.trim() != current.ridePin.trim()) {
      return false;
    }

    try {
      if (!current.isDemo) {
        final response = await ApiService.post(
          '/driver/bookings/rides/${current.id}/start',
          body: {'otp': pin.trim()},
        );
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return false;
        }
      }
    } catch (e) {
      debugPrint('Backend start ride error: $e');
      return false;
    }

    activeRide.value = current.copyWith(status: CityRideStatus.inProgress);
    return true;
  }

  Future<CityRideRequest?> completeCurrentRide() async {
    final current = activeRide.value;
    if (current == null) return null;

    final completed = current.copyWith(
      status: CityRideStatus.completed,
      completedAt: DateTime.now(),
    );

    // Call backend API if real ID
    try {
      if (!current.isDemo) {
        final response = await ApiService.post(
          '/driver/bookings/rides/${current.id}/complete',
        );
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return null;
        }
      }
    } catch (e) {
      debugPrint('Backend complete ride error: $e');
      return null;
    }

    // Add to completed list
    final history = List<CityRideRequest>.from(completedRides.value);
    history.insert(0, completed);
    completedRides.value = history;
    await _saveCompletedRides();

    activeRide.value = completed;
    return completed;
  }

  Future<void> simulateRiderCancel({
    String reason = 'Passenger cancelled the ride request',
    double fee = 50.0,
  }) async {
    final current = activeRide.value;
    if (current == null) return;

    final cancelled = current.copyWith(
      status: CityRideStatus.cancelled,
      cancellationReason: reason,
      cancellationFee: fee,
      completedAt: DateTime.now(),
    );

    final history = List<CityRideRequest>.from(completedRides.value);
    history.insert(0, cancelled);
    completedRides.value = history;
    await _saveCompletedRides();

    activeRide.value = cancelled;
  }

  void clearActiveRide() {
    activeRide.value = null;
  }

  Future<void> refreshIncomingRequests() async {
    try {
      final token = await AuthService.getToken();
      if (token != null && token.isNotEmpty) {
        final response =
            await ApiService.get('/driver/bookings/rides/available');
        if (response.statusCode >= 200 && response.statusCode < 300) {
          final decoded = jsonDecode(response.body) as Map<String, dynamic>;
          final data = decoded['data'];
          final rawRides = data is Map<String, dynamic> ? data['rides'] : null;
          if (rawRides is List) {
            final rides = rawRides
                .whereType<Map<String, dynamic>>()
                .where(_isCityRide)
                .map(CityRideRequest.fromApiJson)
                .where((ride) => ride.id.isNotEmpty)
                .toList()
              ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
            if (rides.isNotEmpty) {
              incomingRequests.value = rides;
              return;
            }
          }
        }
      }
    } catch (e) {
      debugPrint('Could not load live city rides; using demo requests: $e');
    }

    _populateInitialRequests();
  }

  bool _isCityRide(Map<String, dynamic> ride) {
    final bookingType = ride['bookingType']?.toString().toLowerCase();
    final tripType = ride['tripType']?.toString().toLowerCase();
    return bookingType == null ||
        bookingType == 'local' ||
        tripType == 'local' ||
        tripType == 'city';
  }

  Future<void> _loadCompletedRides() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_completedRidesKey);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final List<dynamic> decoded = jsonDecode(jsonStr);
        completedRides.value = decoded
            .map((item) =>
                CityRideRequest.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      debugPrint('Error loading completed city rides: $e');
    }
  }

  Future<void> _loadLiveCompletedRides() async {
    try {
      final token = await AuthService.getToken();
      if (token == null || token.isEmpty) return;

      final response = await ApiService.get('/driver/bookings/rides/history');
      if (response.statusCode < 200 || response.statusCode >= 300) return;

      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      final data = decoded['data'];
      final rawRides = data is Map<String, dynamic> ? data['rides'] : null;
      if (rawRides is! List) return;

      final merged = <String, CityRideRequest>{
        for (final ride in completedRides.value) ride.id: ride,
      };
      for (final rawRide in rawRides.whereType<Map<String, dynamic>>()) {
        if (!_isCityRide(rawRide)) continue;
        final ride = CityRideRequest.fromApiJson(rawRide);
        if (ride.id.isNotEmpty && ride.status == CityRideStatus.completed) {
          merged[ride.id] = ride;
        }
      }

      final rides = merged.values.toList()
        ..sort((a, b) => (b.completedAt ?? b.createdAt)
            .compareTo(a.completedAt ?? a.createdAt));
      completedRides.value = rides;
    } catch (e) {
      debugPrint('Could not load live city ride history: $e');
    }
  }

  Future<void> _saveCompletedRides() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = completedRides.value.map((r) => r.toJson()).toList();
      await prefs.setString(_completedRidesKey, jsonEncode(list));
    } catch (e) {
      debugPrint('Error saving completed city rides: $e');
    }
  }
}
