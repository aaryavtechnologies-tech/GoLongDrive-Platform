/// Core ride data model, shared by the Rides tab, Ride Details screen,
/// Current Ride screen, Earnings tab, and Dashboard.
enum RideStatus { available, upcoming, ongoing, completed, cancelled }

extension RideStatusLabel on RideStatus {
  String get label => switch (this) {
        RideStatus.available => 'Available',
        RideStatus.upcoming => 'Upcoming',
        RideStatus.ongoing => 'Ongoing',
        RideStatus.completed => 'Completed',
        RideStatus.cancelled => 'Cancelled',
      };
}

class Ride {
  final String id;
  final String? customerId;
  final RideStatus status;
  final String? rawStatus;
  final String pickupAddress;
  final String dropAddress;
  final String customerName;
  final String customerPhone;
  final double customerRating;
  final double fare;
  final double baseFare;
  final double pricePerKm;
  final double estimatedFare;
  final double finalFare;
  final double distanceKm;
  final int durationMin;
  final DateTime dateTime;
  final String vehicleModel;
  final String vehicleNumber;
  final String paymentMethod;
  final String paymentStatus;

  // --- Map coordinates (Phase 6) ---
  final double? pickupLat;
  final double? pickupLng;
  final double? dropLat;
  final double? dropLng;

  final bool isGeocoded;

  const Ride({
    required this.id,
    this.customerId,
    required this.status,
    this.rawStatus,
    required this.pickupAddress,
    required this.dropAddress,
    required this.customerName,
    required this.customerPhone,
    required this.customerRating,
    required this.fare,
    this.baseFare = 50.0,
    this.pricePerKm = 15.0,
    this.estimatedFare = 0.0,
    this.finalFare = 0.0,
    required this.distanceKm,
    required this.durationMin,
    required this.dateTime,
    required this.vehicleModel,
    required this.vehicleNumber,
    this.paymentMethod = 'Cash',
    this.paymentStatus = 'Pending',
    this.pickupLat,
    this.pickupLng,
    this.dropLat,
    this.dropLng,
    this.isGeocoded = false,
  });

  factory Ride.fromJson(Map<String, dynamic> json) {
    RideStatus parseStatus(String? s) {
      if (s == 'Searching Driver') return RideStatus.available;
      if (s == 'Confirmed' || s == 'Driver Assigned' || s == 'Driver Arriving' || s == 'Driver Accepted' || s == 'Driver Arrived') return RideStatus.upcoming;
      if (s == 'Trip Started') return RideStatus.ongoing;
      if (s == 'Trip Completed') return RideStatus.completed;
      if (s != null && s.contains('Cancel')) return RideStatus.cancelled;
      return RideStatus.upcoming; // fallback
    }

    final double estFare = (json['estimatedFare'] ?? json['fare'] ?? 0).toDouble();
    final double finFare = (json['finalFare'] ?? 0).toDouble();
    final double dist = (json['estimatedDistance'] ?? json['distanceKm'] ?? 0).toDouble();

    return Ride(
      id: json['bookingId'] ?? json['_id'] ?? '',
      customerId: json['customer'] is Map ? json['customer']['_id'] : json['customer']?.toString(),
      status: parseStatus(json['rideStatus']),
      rawStatus: json['rideStatus'],
      pickupAddress: json['pickupAddress'] ?? json['pickupLocation']?['address'] ?? 'Unknown Pickup',
      dropAddress: json['dropAddress'] ?? json['dropoffLocation']?['address'] ?? 'Unknown Drop',
      customerName: json['customer'] is Map ? (json['customer']['fullName'] ?? 'Customer') : 'Customer',
      customerPhone: json['customer'] is Map ? (json['customer']['phoneNumber'] ?? '') : '',
      customerRating: 4.8,
      fare: finFare > 0 ? finFare : estFare,
      baseFare: (json['baseFare'] ?? 50).toDouble(),
      pricePerKm: (json['pricePerKm'] ?? 15).toDouble(),
      estimatedFare: estFare,
      finalFare: finFare,
      distanceKm: dist > 1000 ? dist / 1000.0 : dist,
      durationMin: ((json['estimatedDuration'] ?? 0) / 60.0).round(),
      dateTime: json['pickupDate'] != null ? DateTime.tryParse(json['pickupDate'].toString()) ?? DateTime.now() : DateTime.now(),
      vehicleModel: json['vehicleType'] ?? '',
      vehicleNumber: '',
      paymentMethod: json['paymentMethod'] ?? 'Online',
      paymentStatus: json['paymentStatus'] ?? 'Pending',
      pickupLat: (json['pickupLat'] ?? json['pickupLocation']?['coordinates']?[1])?.toDouble(),
      pickupLng: (json['pickupLng'] ?? json['pickupLocation']?['coordinates']?[0])?.toDouble(),
      dropLat: (json['dropLat'] ?? json['destinationLat'] ?? json['dropoffLocation']?['coordinates']?[1])?.toDouble(),
      dropLng: (json['dropLng'] ?? json['destinationLng'] ?? json['dropoffLocation']?['coordinates']?[0])?.toDouble(),
    );
  }

  /// True only when both pickup and drop coordinates are present — the
  /// single check every map-rendering widget should gate on.
  bool get hasRouteCoordinates =>
      pickupLat != null && pickupLng != null && dropLat != null && dropLng != null;

  /// Returns a copy of this ride with coordinates filled in, marked
  /// [isGeocoded]. Used by `GeocodingService.geocodeRide` when a ride
  /// arrives with no coordinates and the address text has to be resolved
  /// instead.
  Ride withCoordinates({
    required double pickupLat,
    required double pickupLng,
    required double dropLat,
    required double dropLng,
  }) {
    return Ride(
      id: id,
      customerId: customerId,
      status: status,
      rawStatus: rawStatus,
      pickupAddress: pickupAddress,
      dropAddress: dropAddress,
      customerName: customerName,
      customerPhone: customerPhone,
      customerRating: customerRating,
      fare: fare,
      baseFare: baseFare,
      pricePerKm: pricePerKm,
      estimatedFare: estimatedFare,
      finalFare: finalFare,
      distanceKm: distanceKm,
      durationMin: durationMin,
      dateTime: dateTime,
      vehicleModel: vehicleModel,
      vehicleNumber: vehicleNumber,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      pickupLat: pickupLat,
      pickupLng: pickupLng,
      dropLat: dropLat,
      dropLng: dropLng,
      isGeocoded: true,
    );
  }
}
