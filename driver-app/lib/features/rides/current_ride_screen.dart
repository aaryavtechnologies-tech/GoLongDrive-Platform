import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../app/theme.dart';
import '../../core/data/geocoding_service.dart';
import '../../core/data/mock_data.dart';
import '../../core/models/ride.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/ride_route_map.dart';
import '../navigation/in_app_navigation_screen.dart';

/// Current Ride Screen - Handles the active trip logic.
/// Wiring this to MockData.currentRide for now.
/// AI/Backend: this screen is the core of the driver experience. 
/// We need real-time status updates via WebSockets or long polling eventually.
class CurrentRideScreen extends StatefulWidget {
  const CurrentRideScreen({super.key});

  @override
  State<CurrentRideScreen> createState() => _CurrentRideScreenState();
}

enum _TripStage { arriving, arrived, inProgress, completed }

extension on _TripStage {
  String get label => switch (this) {
        _TripStage.arriving => 'Heading to Pickup',
        _TripStage.arrived => 'Arrived at Pickup',
        _TripStage.inProgress => 'Trip in Progress',
        _TripStage.completed => 'Trip Completed',
      };

  String get actionLabel => switch (this) {
        _TripStage.arriving => "I've Arrived",
        _TripStage.arrived => 'Start Trip',
        _TripStage.inProgress => 'Complete Trip',
        _TripStage.completed => 'Done',
      };
}

class _CurrentRideScreenState extends State<CurrentRideScreen> {
  _TripStage _stage = _TripStage.arriving;

  // Advance the trip status locally.
  // TODO: Backend - Replace with a call to PATCH /rides/:id/status
  void _advance() {
    final previousStage = _stage;
    setState(() {
      _stage = switch (_stage) {
        _TripStage.arriving => _TripStage.arrived,
        _TripStage.arrived => _TripStage.inProgress,
        _TripStage.inProgress => _TripStage.completed,
        _TripStage.completed => _TripStage.completed,
      };
    });

    // The moment the driver taps "Start Trip" (arrived -> inProgress), jump
    // straight into full-screen turn-by-turn navigation to the drop — no
    // extra tap on the map card needed, same as Uber/Ola/Rapido.
    if (previousStage == _TripStage.arrived && _stage == _TripStage.inProgress) {
      _startAutoNavigationToDrop();
    }

    if (_stage == _TripStage.completed) {
      // In a real app, we might navigate to a 'Trip Summary' screen first
      context.pop();
    }
  }

  /// Resolves the current ride's drop coordinates (geocoding the address as
  /// a fallback if the ride has none) and pushes the full-screen in-app
  /// navigation screen automatically. Shows a snackbar instead of silently
  /// doing nothing if no route could be determined at all.
  Future<void> _startAutoNavigationToDrop() async {
    final ride = MockData.currentRide;
    if (ride == null) return;

    final resolved = await GeocodingService.geocodeRide(ride);
    if (!mounted) return;

    if (resolved == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Couldn't start navigation — this ride has no map coordinates "
            'and the drop address could not be located.',
          ),
        ),
      );
      return;
    }

    Navigator.of(context, rootNavigator: true).push(
      MaterialPageRoute(
        builder: (_) => InAppNavigationScreen(
          ride: resolved,
          destination: LatLng(resolved.dropLat!, resolved.dropLng!),
          destinationLabel: resolved.dropAddress,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ride = MockData.currentRide;

    if (ride == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Current Ride')),
        body: Center(
          child: Text('No active ride right now', style: TextStyle(color: AppColors.textMuted)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(8, 8, 24, 8),
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
                        onPressed: () => context.pop(),
                      ),
                      const SizedBox(width: 4),
                      const Text('Current Ride', style: AppText.cardHeadline),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(24, 8, 24, 140),
                    children: [
                      // --- RideStatusCard ---
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: rideCardDecoration(),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 10,
                                  height: 10,
                                  decoration: const BoxDecoration(
                                      shape: BoxShape.circle, color: AppColors.success),
                                ),
                                const SizedBox(width: 10),
                                Text(_stage.label,
                                    style: TextStyle(
                                        color: AppColors.textPrimary, fontSize: 17, fontWeight: FontWeight.w700)),
                              ],
                            ),
                            const SizedBox(height: 16),
                            _stageStepper(),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // --- RideRouteMap (Phase 6) ---
                      // Shows pickup (gold marker) + drop (blue marker) with
                      // the driver's live location dot on top. Falls back to
                      // the old icon placeholder automatically if this ride
                      // has no coordinates (ride.hasRouteCoordinates).
                      // Tappable (Phase 8) — opens the big in-app Navigation
                      // card so the driver can see the full route.
                      RideRouteMapTappable(
                        ride: ride,
                        height: 180,
                        showDriverLocation: true,
                        // Before the rider is picked up, "Start Navigation"
                        // should head to the pickup; once the trip is
                        // underway, it should head to the drop instead.
                        navTarget: _stage == _TripStage.inProgress || _stage == _TripStage.completed
                            ? NavTarget.drop
                            : NavTarget.pickup,
                      ),
                      const SizedBox(height: 16),

                      // --- RideTimeline (pickup / drop) ---
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: cardDecoration(radius: 20),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              children: [
                                const Icon(Icons.circle, size: 10, color: AppColors.gold),
                                Container(width: 1.5, height: 36, color: AppColors.divider),
                                Icon(Icons.location_on, size: 12, color: AppColors.textMuted),
                              ],
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(ride.pickupAddress,
                                      style: TextStyle(color: AppColors.textPrimary, fontSize: 14, height: 1.3)),
                                  const SizedBox(height: 20),
                                  Text(ride.dropAddress,
                                      style: TextStyle(
                                          color: AppColors.textSecondary, fontSize: 14, height: 1.3)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // --- CustomerCard (compact) ---
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: cardDecoration(radius: 20),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration:
                                  const BoxDecoration(shape: BoxShape.circle, color: AppColors.goldTint),
                              child: const Icon(Icons.person, color: AppColors.gold, size: 22),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(ride.customerName,
                                      style: TextStyle(
                                          color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700)),
                                  Text('₹${ride.fare.toStringAsFixed(0)} · ${ride.paymentMethod}',
                                      style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                                ],
                              ),
                            ),
                            _roundIconButton(Icons.message_outlined),
                            const SizedBox(width: 10),
                            _roundIconButton(Icons.call),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // --- RideSupportCard ---
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: cardDecoration(radius: 20, bg: AppColors.surfaceAlt),
                        child: Row(
                          children: [
                            const Icon(Icons.support_agent, color: AppColors.gold, size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text('Need help with this trip?',
                                  style: TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                            ),
                            TextButton(
                              onPressed: () {},
                              child: const Text('Contact Support',
                                  style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // --- StickyActionBar ---
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  border: Border(top: BorderSide(color: AppColors.borderSubtle2)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 12, offset: const Offset(0, -4)),
                  ],
                ),
                child: AppButton(
                  label: _stage.actionLabel,
                  onPressed: _advance,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _stageStepper() {
    final stages = _TripStage.values;
    final currentIndex = stages.indexOf(_stage);
    return Row(
      children: List.generate(stages.length * 2 - 1, (i) {
        if (i.isOdd) {
          final leftDone = (i - 1) ~/ 2 < currentIndex;
          return Expanded(
            child: Container(height: 3, color: leftDone ? AppColors.gold : AppColors.divider),
          );
        }
        final stepIndex = i ~/ 2;
        final done = stepIndex <= currentIndex;
        return Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: done ? AppColors.gold : AppColors.surfaceAlt2,
            border: Border.all(color: done ? AppColors.gold : AppColors.dividerStrong),
          ),
          child: done
              ? const Icon(Icons.check, size: 14, color: Colors.black)
              : null,
        );
      }),
    );
  }

  Widget _roundIconButton(IconData icon) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderSubtle2),
      ),
      child: Icon(icon, color: AppColors.gold, size: 18),
    );
  }
}
