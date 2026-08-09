/// Core ride data model, shared by the Rides tab, Ride Details screen,
/// Current Ride screen, Earnings tab, and Dashboard.
enum RideStatus { upcoming, ongoing, completed, cancelled }

extension RideStatusLabel on RideStatus {
  String get label => switch (this) {
        RideStatus.upcoming => 'Upcoming',
        RideStatus.ongoing => 'Ongoing',
        RideStatus.completed => 'Completed',
        RideStatus.cancelled => 'Cancelled',
      };
}

class Ride {
  final String id;
  final RideStatus status;
  final String pickupAddress;
  final String dropAddress;
  final String customerName;
  final String customerPhone;
  final double customerRating;
  final double fare;
  final double distanceKm;
  final int durationMin;
  final DateTime dateTime;
  final String vehicleModel;
  final String vehicleNumber;
  final String paymentMethod;

  // --- Map coordinates (Phase 6) ---
  // Nullable so existing/mock rides without coordinates still compile and
  // render — RideRouteMap (core/widgets/ride_route_map.dart) falls back to
  // a placeholder card when either pair is null. Backend should populate
  // these from geocoding the address strings above, or collect them
  // directly at booking time on the customer app — see BACKEND_API_SPEC.md
  // §3 for the field addition.
  final double? pickupLat;
  final double? pickupLng;
  final double? dropLat;
  final double? dropLng;

  // True when pickupLat/pickupLng/dropLat/dropLng were filled in by
  // geocoding pickupAddress/dropAddress (GeocodingService.geocodeRide)
  // because the ride arrived with no coordinates at all, rather than being
  // the precise values originally recorded on the ride. Surfaced in the
  // fullscreen map card's coordinate debug strip so an approximate,
  // address-derived location is never mistaken for an exact one.
  final bool isGeocoded;

  const Ride({
    required this.id,
    required this.status,
    required this.pickupAddress,
    required this.dropAddress,
    required this.customerName,
    required this.customerPhone,
    required this.customerRating,
    required this.fare,
    required this.distanceKm,
    required this.durationMin,
    required this.dateTime,
    required this.vehicleModel,
    required this.vehicleNumber,
    this.paymentMethod = 'Cash',
    this.pickupLat,
    this.pickupLng,
    this.dropLat,
    this.dropLng,
    this.isGeocoded = false,
  });

  factory Ride.fromJson(Map<String, dynamic> json) {
    RideStatus parseStatus(String? s) {
      if (s == 'Confirmed' || s == 'Driver Assigned' || s == 'Driver Arriving' || s == 'Driver Accepted') return RideStatus.upcoming;
      if (s == 'Trip Started') return RideStatus.ongoing;
      if (s == 'Trip Completed') return RideStatus.completed;
      if (s == 'Cancelled') return RideStatus.cancelled;
      return RideStatus.upcoming; // fallback
    }

    return Ride(
      id: json['_id'] ?? '',
      status: parseStatus(json['rideStatus']),
      pickupAddress: json['pickupLocation']?['address'] ?? 'Unknown Pickup',
      dropAddress: json['dropoffLocation']?['address'] ?? 'Unknown Drop',
      customerName: json['customer']?['fullName'] ?? 'Customer',
      customerPhone: json['customer']?['phoneNumber'] ?? '',
      customerRating: 4.8, // Fallback if no rating provided
      fare: (json['estimatedFare'] ?? 0).toDouble(),
      distanceKm: (json['estimatedDistance'] ?? 0) / 1000.0,
      durationMin: ((json['estimatedDuration'] ?? 0) / 60.0).round(), // backend gives seconds
      dateTime: json['pickupDate'] != null ? DateTime.parse(json['pickupDate']) : DateTime.now(),
      vehicleModel: json['vehicleType'] ?? '',
      vehicleNumber: '', // usually from driver, but we only have driver-side here
      paymentMethod: json['paymentMethod'] ?? 'Online',
      pickupLat: json['pickupLocation']?['coordinates']?[1],
      pickupLng: json['pickupLocation']?['coordinates']?[0],
      dropLat: json['dropoffLocation']?['coordinates']?[1],
      dropLng: json['dropoffLocation']?['coordinates']?[0],
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
      status: status,
      pickupAddress: pickupAddress,
      dropAddress: dropAddress,
      customerName: customerName,
      customerPhone: customerPhone,
      customerRating: customerRating,
      fare: fare,
      distanceKm: distanceKm,
      durationMin: durationMin,
      dateTime: dateTime,
      vehicleModel: vehicleModel,
      vehicleNumber: vehicleNumber,
      paymentMethod: paymentMethod,
      pickupLat: pickupLat,
      pickupLng: pickupLng,
      dropLat: dropLat,
      dropLng: dropLng,
      isGeocoded: true,
    );
  }
}
