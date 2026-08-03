// lib/models/upcoming_ride.dart

/// State of a ride that hasn't finished yet. Distinct from [RideStatus]
/// (in ride_history_item.dart), which only covers terminal states.
enum UpcomingRideStatus { searching, driverAssigned, scheduled }

extension UpcomingRideStatusInfo on UpcomingRideStatus {
  String get label {
    switch (this) {
      case UpcomingRideStatus.searching:
        return 'Finding driver';
      case UpcomingRideStatus.driverAssigned:
        return 'Driver on the way';
      case UpcomingRideStatus.scheduled:
        return 'Scheduled';
    }
  }
}

/// A single active-or-scheduled ride shown on the "Upcoming" tab of
/// My Rides.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only — `MyRidesScreen` seeds its Upcoming tab from `_mockUpcoming` in
/// its own State. To wire this up:
///   1. `GET /api/rides/active` (currently-in-progress ride, if any) and/or
///      `GET /api/rides/scheduled` (future scheduled bookings) -> merge into
///      `List<UpcomingRide>`. This is also the natural place to add a
///      WebSocket/polling subscription so status (searching -> assigned ->
///      en route) updates live instead of needing a manual refresh.
///   2. "Track" on a live ride should push into the existing
///      `DriverAssignedScreen` (it already knows how to render an assigned
///      driver) rather than a new screen — pass the real `RideRequest` /
///      `AssignedDriver` once the backend returns them instead of the mock
///      generator currently in `driver_assigned_screen.dart`.
///   3. "Cancel" on a scheduled ride -> `DELETE /api/rides/scheduled/{id}`
///      (distinct from the in-ride cancel flow already in
///      `driver_assigned_screen.dart`).
/// ===========================================================================
class UpcomingRide {
  final String id;
  final String fromAddress;
  final String toAddress;
  final String whenLabel; // e.g. "Now" or "Tomorrow, 9:00 AM"
  final String vehicleLabel;
  final String estimatedFare; // display string, e.g. "₹210 (estimated)"
  final UpcomingRideStatus status;

  const UpcomingRide({
    required this.id,
    required this.fromAddress,
    required this.toAddress,
    required this.whenLabel,
    required this.vehicleLabel,
    required this.estimatedFare,
    required this.status,
  });
}
