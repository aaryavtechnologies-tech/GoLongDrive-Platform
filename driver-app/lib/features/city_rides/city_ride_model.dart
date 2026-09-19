enum CityRideStatus {
  pending,
  accepted,
  arrived,
  inProgress,
  completed,
  cancelled,
}

class CityRideRequest {
  final String id;
  final String bookingId;
  final String riderName;
  final double riderRating;
  final int riderRidesCount;
  final String riderPhone;
  final String? riderPhoto;

  final String pickupAddress;
  final double pickupLat;
  final double pickupLng;
  final double pickupDistanceKm;
  final int pickupEtaMin;

  final String dropAddress;
  final double dropLat;
  final double dropLng;
  final double tripDistanceKm;
  final int tripDurationMin;

  final double estimatedFare;
  final String paymentMethod;
  final String ridePin;
  final DateTime createdAt;

  CityRideStatus status;
  String? cancellationReason;
  double? cancellationFee;
  DateTime? completedAt;

  bool get isDemo => id.startsWith('cr_req_');

  CityRideRequest({
    required this.id,
    required this.bookingId,
    required this.riderName,
    required this.riderRating,
    required this.riderRidesCount,
    required this.riderPhone,
    this.riderPhoto,
    required this.pickupAddress,
    required this.pickupLat,
    required this.pickupLng,
    required this.pickupDistanceKm,
    required this.pickupEtaMin,
    required this.dropAddress,
    required this.dropLat,
    required this.dropLng,
    required this.tripDistanceKm,
    required this.tripDurationMin,
    required this.estimatedFare,
    required this.paymentMethod,
    required this.ridePin,
    required this.createdAt,
    this.status = CityRideStatus.pending,
    this.cancellationReason,
    this.cancellationFee,
    this.completedAt,
  });

  CityRideRequest copyWith({
    CityRideStatus? status,
    String? cancellationReason,
    double? cancellationFee,
    DateTime? completedAt,
  }) {
    return CityRideRequest(
      id: id,
      bookingId: bookingId,
      riderName: riderName,
      riderRating: riderRating,
      riderRidesCount: riderRidesCount,
      riderPhone: riderPhone,
      riderPhoto: riderPhoto,
      pickupAddress: pickupAddress,
      pickupLat: pickupLat,
      pickupLng: pickupLng,
      pickupDistanceKm: pickupDistanceKm,
      pickupEtaMin: pickupEtaMin,
      dropAddress: dropAddress,
      dropLat: dropLat,
      dropLng: dropLng,
      tripDistanceKm: tripDistanceKm,
      tripDurationMin: tripDurationMin,
      estimatedFare: estimatedFare,
      paymentMethod: paymentMethod,
      ridePin: ridePin,
      createdAt: createdAt,
      status: status ?? this.status,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      cancellationFee: cancellationFee ?? this.cancellationFee,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'bookingId': bookingId,
        'riderName': riderName,
        'riderRating': riderRating,
        'riderRidesCount': riderRidesCount,
        'riderPhone': riderPhone,
        'riderPhoto': riderPhoto,
        'pickupAddress': pickupAddress,
        'pickupLat': pickupLat,
        'pickupLng': pickupLng,
        'pickupDistanceKm': pickupDistanceKm,
        'pickupEtaMin': pickupEtaMin,
        'dropAddress': dropAddress,
        'dropLat': dropLat,
        'dropLng': dropLng,
        'tripDistanceKm': tripDistanceKm,
        'tripDurationMin': tripDurationMin,
        'estimatedFare': estimatedFare,
        'paymentMethod': paymentMethod,
        'ridePin': ridePin,
        'createdAt': createdAt.toIso8601String(),
        'status': status.name,
        'cancellationReason': cancellationReason,
        'cancellationFee': cancellationFee,
        'completedAt': completedAt?.toIso8601String(),
      };

  factory CityRideRequest.fromJson(Map<String, dynamic> json) {
    return CityRideRequest(
      id: json['id'] ?? '',
      bookingId: json['bookingId'] ?? '',
      riderName: json['riderName'] ?? 'Rider',
      riderRating: (json['riderRating'] as num?)?.toDouble() ?? 4.8,
      riderRidesCount: json['riderRidesCount'] ?? 10,
      riderPhone: json['riderPhone'] ?? '+91 98765 43210',
      riderPhoto: json['riderPhoto'],
      pickupAddress: json['pickupAddress'] ?? '',
      pickupLat: (json['pickupLat'] as num?)?.toDouble() ?? 23.0225,
      pickupLng: (json['pickupLng'] as num?)?.toDouble() ?? 72.5714,
      pickupDistanceKm: (json['pickupDistanceKm'] as num?)?.toDouble() ?? 1.2,
      pickupEtaMin: json['pickupEtaMin'] ?? 4,
      dropAddress: json['dropAddress'] ?? '',
      dropLat: (json['dropLat'] as num?)?.toDouble() ?? 23.0300,
      dropLng: (json['dropLng'] as num?)?.toDouble() ?? 72.5800,
      tripDistanceKm: (json['tripDistanceKm'] as num?)?.toDouble() ?? 4.5,
      tripDurationMin: json['tripDurationMin'] ?? 15,
      estimatedFare: (json['estimatedFare'] as num?)?.toDouble() ?? 150.0,
      paymentMethod: json['paymentMethod'] ?? 'Cash',
      ridePin: json['ridePin'] ?? '1234',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      status: CityRideStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => CityRideStatus.pending,
      ),
      cancellationReason: json['cancellationReason'],
      cancellationFee: (json['cancellationFee'] as num?)?.toDouble(),
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'])
          : null,
    );
  }

  factory CityRideRequest.fromApiJson(Map<String, dynamic> json) {
    final customer = json['customer'];
    final customerMap = customer is Map<String, dynamic> ? customer : null;
    final pickupLocation = json['pickupLocation'];
    final pickupMap =
        pickupLocation is Map<String, dynamic> ? pickupLocation : null;
    final dropoffLocation = json['dropoffLocation'];
    final dropoffMap =
        dropoffLocation is Map<String, dynamic> ? dropoffLocation : null;

    double number(dynamic value, [double fallback = 0]) =>
        (value as num?)?.toDouble() ?? fallback;
    int wholeNumber(dynamic value, [int fallback = 0]) =>
        (value as num?)?.toInt() ?? fallback;

    final rawStatus = (json['rideStatus'] ?? '').toString().toLowerCase();
    final status = switch (rawStatus) {
      'driver assigned' ||
      'driver_assigned' ||
      'driver accepted' ||
      'driver_accepted' ||
      'confirmed' ||
      'driver arriving' ||
      'driver_arriving' =>
        CityRideStatus.accepted,
      'trip started' ||
      'trip_started' ||
      'in_progress' =>
        CityRideStatus.inProgress,
      'trip completed' || 'trip_completed' => CityRideStatus.completed,
      String value when value.contains('cancel') => CityRideStatus.cancelled,
      _ => CityRideStatus.pending,
    };

    return CityRideRequest(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      bookingId: (json['bookingId'] ?? json['_id'] ?? '').toString(),
      riderName:
          (customerMap?['fullName'] ?? json['riderName'] ?? 'Rider').toString(),
      riderRating: number(customerMap?['rating'] ?? json['riderRating'], 4.8),
      riderRidesCount:
          wholeNumber(customerMap?['ridesCount'] ?? json['riderRidesCount'], 0),
      riderPhone:
          (customerMap?['phoneNumber'] ?? json['riderPhone'] ?? '').toString(),
      riderPhoto:
          (customerMap?['profileImage'] ?? json['riderPhoto'])?.toString(),
      pickupAddress:
          (pickupMap?['address'] ?? json['pickupAddress'] ?? 'Pickup')
              .toString(),
      pickupLat: number(json['pickupLat'] ?? pickupMap?['lat'], 23.0225),
      pickupLng: number(json['pickupLng'] ?? pickupMap?['lng'], 72.5714),
      pickupDistanceKm: number(json['pickupDistanceKm']),
      pickupEtaMin: wholeNumber(json['pickupEtaMin']),
      dropAddress:
          (dropoffMap?['address'] ?? json['dropAddress'] ?? 'Destination')
              .toString(),
      dropLat: number(json['destinationLat'] ?? dropoffMap?['lat'], 23.0300),
      dropLng: number(json['destinationLng'] ?? dropoffMap?['lng'], 72.5800),
      tripDistanceKm: number(json['estimatedDistance'] ?? json['distance']),
      tripDurationMin: wholeNumber(json['tripDurationMin']),
      estimatedFare: number(json['finalFare'] ?? json['estimatedFare']),
      paymentMethod: (json['paymentMethod'] ?? 'Cash').toString(),
      // Live PINs are verified by the backend and must never be exposed here.
      ridePin: '',
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()) ??
          DateTime.now(),
      status: status,
      cancellationReason: json['cancellationReason']?.toString(),
      cancellationFee: number(json['cancellationFee']),
      completedAt: DateTime.tryParse(
          (json['completedAt'] ?? json['rideCompletedAt'] ?? '').toString()),
    );
  }
}
