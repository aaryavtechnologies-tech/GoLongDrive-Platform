// lib/models/ride_request.dart
//
// ============================================================================
// BACKEND HOOKUP — read this before wiring a real pricing/fleet API
// ============================================================================
// GoLongDrive is an OUTSTATION / MULTI-DAY rental app, not a city point-to-
// point taxi app. A rider books a specific CAR for a DATE RANGE, and pays:
//
//      totalFare = (car.perDayRate * numberOfDays) + (car.perKmRate * distanceKm)
//
// Everything in this file that stands in for a backend is marked with
// "MOCK DATA" or "BACKEND HOOKUP" comments below. In short:
//   1. `mockCarModels`      -> replace with GET /api/vehicles (or /fleet),
//                              filtered by which cars are actually available
//                              for the rider's chosen city + date range.
//   2. `RideRequest.totalFare` -> this is computed client-side for now.
//                              Once a real pricing/quote endpoint exists
//                              (which may include taxes, driver allowance,
//                              night charges, toll estimate, etc.), replace
//                              this getter's formula with the value the
//                              backend returns, don't keep calculating it
//                              on-device — server-side pricing is the
//                              source of truth for anything involving money.
//   3. `AssignedDriver`      -> still fully mock (see driver_assigned_screen
//                              .dart), unrelated to the pricing change here.
// ============================================================================

import 'package:google_maps_flutter/google_maps_flutter.dart';

/// The four rental categories GoLongDrive offers. Matches the categories in
/// the official pricing sheet 1:1 — if a new category is added on the
/// backend, add it here too and the UI (category sections in
/// confirm_ride_screen.dart) will pick it up automatically since it just
/// iterates `VehicleCategory.values`.
enum VehicleCategory { sedan, mpv, premium, suv }

extension VehicleCategoryInfo on VehicleCategory {
  /// Display label shown as the section header on the Confirm Ride screen.
  String get label {
    switch (this) {
      case VehicleCategory.sedan:
        return 'Sedan';
      case VehicleCategory.mpv:
        return 'MPV';
      case VehicleCategory.premium:
        return 'Premium';
      case VehicleCategory.suv:
        return 'SUV';
    }
  }

  /// Short line under the category header — purely cosmetic copy, safe to
  /// edit freely without touching pricing logic.
  String get subtitle {
    switch (this) {
      case VehicleCategory.sedan:
        return 'Comfortable 4-seaters, great for city-to-city trips';
      case VehicleCategory.mpv:
        return 'Extra boot space, ideal for family trips';
      case VehicleCategory.premium:
        return 'Top-tier comfort for longer journeys';
      case VehicleCategory.suv:
        return 'Rugged and spacious, built for long hauls';
    }
  }

  /// Icon shown on each category header. Swap freely for design changes —
  /// not read by any pricing or backend logic.
  String get iconAsset => 'category_${name}'; // e.g. asset key placeholder
}

/// A single bookable car. One `CarModel` = one row in the pricing sheet.
///
/// MOCK DATA: `mockCarModels` below is hand-entered from the pricing PDF
/// supplied by the client (Sedan/MPV/Premium/SUV, 11 cars total). When the
/// real fleet/pricing backend exists, fetch this list from there instead —
/// keep the field names identical (`name`, `category`, `perDayRate`,
/// `perKmRate`) so nothing else in the booking flow needs to change.
class CarModel {
  final String id;
  final String name;
  final VehicleCategory category;
  final double perDayRate;
  final double perKmRate;
  final int seatCount;

  const CarModel({
    required this.id,
    required this.name,
    required this.category,
    required this.perDayRate,
    required this.perKmRate,
    this.seatCount = 4,
  });
}

/// MOCK DATA — replace with a live fetch (e.g. `GET /api/vehicles`) once
/// the fleet/pricing backend exists. Rates transcribed directly from the
/// GoLongDrive Premium Pricing List PDF (₹/day, ₹/km):
///
///   Sedan   — Swift Dzire, Hyundai Aura, Tata Tigor
///   MPV     — Maruti Suzuki Ertiga, Toyota Rumion
///   Premium — Toyota Innova Crysta, Tata Altroz, Maruti Suzuki Baleno
///   SUV     — Mahindra Scorpio, Mahindra Bolero
///
/// `id` values are simple slugs — if the backend assigns its own vehicle
/// IDs, swap these for the real ones so booking references stay stable.
const List<CarModel> mockCarModels = [
  // Sedan
  CarModel(id: 'sedan_swift_dzire', name: 'Swift Dzire', category: VehicleCategory.sedan, perDayRate: 2000, perKmRate: 15),
  CarModel(id: 'sedan_hyundai_aura', name: 'Hyundai Aura', category: VehicleCategory.sedan, perDayRate: 2000, perKmRate: 15),
  CarModel(id: 'sedan_tata_tigor', name: 'Tata Tigor', category: VehicleCategory.sedan, perDayRate: 1800, perKmRate: 15),

  // MPV
  CarModel(id: 'mpv_ertiga', name: 'Maruti Suzuki Ertiga', category: VehicleCategory.mpv, perDayRate: 2500, perKmRate: 17, seatCount: 7),
  CarModel(id: 'mpv_rumion', name: 'Toyota Rumion', category: VehicleCategory.mpv, perDayRate: 2800, perKmRate: 17, seatCount: 7),

  // Premium
  CarModel(id: 'premium_innova_crysta', name: 'Toyota Innova Crysta', category: VehicleCategory.premium, perDayRate: 3200, perKmRate: 18, seatCount: 7),
  CarModel(id: 'premium_altroz', name: 'Tata Altroz', category: VehicleCategory.premium, perDayRate: 2000, perKmRate: 15),
  CarModel(id: 'premium_baleno', name: 'Maruti Suzuki Baleno', category: VehicleCategory.premium, perDayRate: 2000, perKmRate: 15),

  // SUV
  CarModel(id: 'suv_scorpio', name: 'Mahindra Scorpio', category: VehicleCategory.suv, perDayRate: 3000, perKmRate: 18, seatCount: 7),
  CarModel(id: 'suv_bolero', name: 'Mahindra Bolero', category: VehicleCategory.suv, perDayRate: 2000, perKmRate: 17, seatCount: 7),
];

/// Carries the trip the rider is booking through the ENTIRE flow:
/// SetLocations -> TripDetails -> ConfirmRide -> DriverAssigned.
///
/// This is built up incrementally — each screen fills in more fields via
/// `copyWith` and hands the fuller object to the next screen. At any given
/// point some fields may still be `null` because that step hasn't happened
/// yet:
///   - After SetLocations:  pickup/drop set, everything else null.
///   - After TripDetails:   + startDate/returnDate set.
///   - After ConfirmRide:   + selectedCar/distanceKm set (fare is derived).
///
/// BACKEND HOOKUP: once a real booking endpoint exists, the fully-populated
/// `RideRequest` (right before navigating to DriverAssigned) is exactly the
/// payload shape you'd POST to something like `POST /api/bookings` — pickup/
/// drop coordinates, ISO dates, selected vehicle ID, and the computed
/// distance. Swap the mock `DriverAssignedScreen._findDriver()` call for
/// that real POST + a socket/poll for match status.
class RideRequest {
  final String pickupAddress;
  final LatLng pickupLatLng;
  final String dropAddress;
  final LatLng dropLatLng;

  /// Trip date range — both null until TripDetailsScreen sets them.
  /// Stored as whole-day `DateTime` values (time-of-day is ignored).
  final DateTime? startDate;
  final DateTime? returnDate;

  /// Rider's chosen car — null until ConfirmRideScreen sets it.
  final CarModel? selectedCar;

  /// Road distance in km for the pickup -> drop route, as computed by
  /// DirectionsService on the Confirm Ride screen (falls back to
  /// straight-line distance if the Directions API call fails — see
  /// confirm_ride_screen.dart). Null until that screen calculates it.
  final double? distanceKm;

  const RideRequest({
    required this.pickupAddress,
    required this.pickupLatLng,
    required this.dropAddress,
    required this.dropLatLng,
    this.startDate,
    this.returnDate,
    this.selectedCar,
    this.distanceKm,
  });

  /// Inclusive day count between startDate and returnDate — e.g. Mon->Mon
  /// is 1 day, Mon->Tue is 2 days. A same-day round trip still bills as a
  /// minimum of 1 day. Returns null if dates aren't set yet.
  int? get numberOfDays {
    if (startDate == null || returnDate == null) return null;
    final start = DateTime(startDate!.year, startDate!.month, startDate!.day);
    final end = DateTime(returnDate!.year, returnDate!.month, returnDate!.day);
    final diff = end.difference(start).inDays + 1;
    return diff < 1 ? 1 : diff;
  }

  /// Total estimated fare: (per-day rate * days) + (per-km rate * distance).
  /// Returns null until a car is selected AND distance is known — both
  /// happen on the Confirm Ride screen, so this is really only non-null in
  /// the final moments before DriverAssigned.
  ///
  /// BACKEND HOOKUP: this is a CLIENT-SIDE ESTIMATE ONLY. Once a real quote/
  /// pricing endpoint exists, call it instead and treat its response as the
  /// authoritative fare — don't let this getter be the final word on what a
  /// rider actually gets charged.
  double? get estimatedFare {
    final days = numberOfDays;
    if (days == null || selectedCar == null || distanceKm == null) return null;
    final dayCost = selectedCar!.perDayRate * days;
    final kmCost = selectedCar!.perKmRate * distanceKm!;
    return dayCost + kmCost;
  }

  RideRequest copyWith({
    String? pickupAddress,
    LatLng? pickupLatLng,
    String? dropAddress,
    LatLng? dropLatLng,
    DateTime? startDate,
    DateTime? returnDate,
    CarModel? selectedCar,
    double? distanceKm,
  }) {
    return RideRequest(
      pickupAddress: pickupAddress ?? this.pickupAddress,
      pickupLatLng: pickupLatLng ?? this.pickupLatLng,
      dropAddress: dropAddress ?? this.dropAddress,
      dropLatLng: dropLatLng ?? this.dropLatLng,
      startDate: startDate ?? this.startDate,
      returnDate: returnDate ?? this.returnDate,
      selectedCar: selectedCar ?? this.selectedCar,
      distanceKm: distanceKm ?? this.distanceKm,
    );
  }
}

/// Mock driver assigned after confirming a ride — no real matching backend
/// yet, so this is randomly generated to give the DriverAssigned screen
/// something real-looking to show. Unrelated to the pricing model above;
/// left unchanged from the previous version of this file.
class AssignedDriver {
  final String name;
  final double rating;
  final String vehicleModel;
  final String plateNumber;
  final int etaMinutes;

  const AssignedDriver({
    required this.name,
    required this.rating,
    required this.vehicleModel,
    required this.plateNumber,
    required this.etaMinutes,
  });
}
