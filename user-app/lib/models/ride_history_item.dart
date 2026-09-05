// lib/models/ride_history_item.dart
import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';

/// Terminal states a *past* ride can be in. Deliberately excludes any
/// "in progress" state — active rides live in [UpcomingRide], not here.
enum RideStatus { completed, cancelled }

extension RideStatusInfo on RideStatus {
  String get label {
    switch (this) {
      case RideStatus.completed:
        return 'Completed';
      case RideStatus.cancelled:
        return 'Cancelled';
    }
  }

  Color get color {
    switch (this) {
      case RideStatus.completed:
        return AppColors.success;
      case RideStatus.cancelled:
        return AppColors.error;
    }
  }
}

/// A single past ride — used both as a summary row (Ride History / the
/// "Past" tab of My Rides) AND as the full record shown on
/// `RideDetailsScreen` once a row is tapped.
///
/// The "row" fields (from/to address, dateLabel, fare, status,
/// vehicleLabel) are required and always populated. The "detail" fields
/// below are nullable — a real `GET /api/rides/history` response would
/// always include them (this is one JSON object either way), but they're
/// nullable here so existing mock/list code doesn't need every field filled
/// in just to render a row. `RideDetailsScreen` should treat a null detail
/// field as "not available for this ride" and hide that section rather than
/// crash or show a blank.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only — both `RideHistoryScreen` and the Past tab of `MyRidesScreen`
/// seed themselves from a mock list in their own State classes (same mock
/// list shape, so swapping one data source covers both). To wire this up:
///   1. `GET /api/rides/history?status=&page=` -> `List<RideHistoryItem>`,
///      with every field below populated (not just the row subset).
///      Natural home: `lib/core/data/ride_service.dart`. Add pagination
///      (the ListViews here already use `ListView.builder`-friendly shapes,
///      just wire a "load more" at the bottom / on scroll-end).
///   2. Tapping a row pushes `RideDetailsScreen(ride: ride)` — see
///      `screens/rides/ride_details_screen.dart`. "Download receipt" and
///      "Report an issue" on that screen are still placeholders; wire them
///      to a real receipt-generation endpoint and the issue-report flow
///      respectively once those exist.
///   3. Filter chips (All/Completed/Cancelled) currently filter the mock
///      list client-side — either keep that (fine for a small page) or move
///      the filter into the `status=` query param above.
/// ===========================================================================
class RideHistoryItem {
  // --- Row fields (always populated) ---
  final String id;
  final String fromAddress;
  final String toAddress;
  final String dateLabel; // display string, e.g. "Yesterday, 6:42 PM"
  final String fare; // display string, e.g. "₹186"
  final RideStatus status;
  final String vehicleLabel; // e.g. "Sedan" — category, shown on the row

  // --- Detail-only fields (nullable — populate for a full detail screen) ---
  final String? carName; // specific car, e.g. "Swift Dzire" (row only shows category)
  final String? startDateLabel; // e.g. "12 Jul 2026"
  final String? returnDateLabel; // e.g. "14 Jul 2026"
  final int? numberOfDays;
  final double? distanceKm;
  final double? baseFare;
  final double? distanceCharge;
  final double? pricePerKm;
  final String? driverName;
  final double? driverRating;
  final String? plateNumber;
  final String? paymentLabel; // e.g. "UPI" / "Cash" / "Visa •••• 4242"
  final String? cancellationReason; // populated only when status == cancelled

  const RideHistoryItem({
    required this.id,
    required this.fromAddress,
    required this.toAddress,
    required this.dateLabel,
    required this.fare,
    required this.status,
    required this.vehicleLabel,
    this.carName,
    this.startDateLabel,
    this.returnDateLabel,
    this.numberOfDays,
    this.distanceKm,
    this.baseFare,
    this.distanceCharge,
    this.pricePerKm,
    this.driverName,
    this.driverRating,
    this.plateNumber,
    this.paymentLabel,
    this.cancellationReason,
  });

  /// True once enough detail fields exist to show a fare breakdown
  /// on RideDetailsScreen.
  bool get hasFareBreakdown => baseFare != null && distanceCharge != null;

  double get totalFareAmount => (baseFare ?? 0) + (distanceCharge ?? 0);
}
