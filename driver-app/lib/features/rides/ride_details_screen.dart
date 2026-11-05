import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/data/api_service.dart';
import '../../app/theme.dart';
import '../../core/data/mock_data.dart';
import '../../core/models/ride.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/ride_route_map.dart';

/// INFERRED build (PROJECT_STATUS.md item 36) — no source component for
/// this screen was in the original zip, so it's assembled from the
/// established Card Recipe + gold/dark visual language, matching the
/// structure of a typical ride-details view: header, customer card,
/// location card (pickup/drop), vehicle/fare summary.
///
/// Reads `rideId` from route arguments (same pattern as `OtpScreen` reading
/// `phone` — see PROJECT_STATUS.md §6, Phase 3 notes) and looks it up in
/// `MockData.rides`. Read-only: no local state, no mutations.
class RideDetailsScreen extends StatefulWidget {
  const RideDetailsScreen({super.key});

  @override
  State<RideDetailsScreen> createState() => _RideDetailsScreenState();
}

class _RideDetailsScreenState extends State<RideDetailsScreen> {
  Ride? _ride;
  bool _isLoading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _resolveRide();
  }

  Future<void> _resolveRide() async {
    final args = GoRouterState.of(context).extra as Map<String, dynamic>?;
    final rideId = args?['rideId'] as String?;
    final passedRide = args?['ride'];

    if (passedRide is Ride) {
      if (mounted) setState(() { _ride = passedRide; _isLoading = false; });
      return;
    }

    if (passedRide is Map<String, dynamic>) {
      if (mounted) setState(() { _ride = Ride.fromJson(passedRide); _isLoading = false; });
      return;
    }

    if (rideId != null) {
      for (final r in MockData.rides) {
        if (r.id == rideId) {
          if (mounted) setState(() { _ride = r; _isLoading = false; });
          return;
        }
      }

      // Fetch live ride details from API
      try {
        final res = await ApiService.get('/rides/$rideId');
        if (res.statusCode == 200) {
          final decoded = jsonDecode(res.body);
          if (decoded is Map<String, dynamic> && decoded['data']?['booking'] != null) {
            final bookingJson = Map<String, dynamic>.from(decoded['data']['booking']);
            if (mounted) {
              setState(() {
                _ride = Ride.fromJson(bookingJson);
                _isLoading = false;
              });
              return;
            }
          }
        }
      } catch (e) {
        debugPrint('Failed to load live ride details: $e');
      }
    }

    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Ride Details')),
        body: Center(
          child: CircularProgressIndicator(color: AppColors.gold),
        ),
      );
    }

    if (_ride == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Ride Details')),
        body: Center(
          child: Text('Ride not found',
              style: TextStyle(color: AppColors.textMuted)),
        ),
      );
    }

    final r = _ride!;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // --- RideHeader ---
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 24, 8),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: 4),
                  const Text('Ride Details', style: AppText.cardHeadline),
                  const Spacer(),
                  _statusBadge(r.status),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                children: [
                  // --- CustomerCard ---
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: cardDecoration(radius: 20),
                    child: Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.goldTint,
                          ),
                          child: const Icon(Icons.person,
                              color: AppColors.gold, size: 26),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(r.customerName,
                                  style: TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700)),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.star,
                                      size: 14, color: AppColors.gold),
                                  const SizedBox(width: 4),
                                  Text(r.customerRating.toStringAsFixed(1),
                                      style: TextStyle(
                                          color: AppColors.textSecondary,
                                          fontSize: 13)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: () async {
                            final uri = Uri.parse('tel:${r.customerPhone}');
                            if (await canLaunchUrl(uri)) {
                              await launchUrl(uri);
                            }
                          },
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: AppColors.surfaceAlt2,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.borderSubtle2),
                            ),
                            child: const Icon(Icons.call,
                                color: AppColors.gold, size: 20),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // --- LocationCard ---
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: cardDecoration(radius: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              children: [
                                const Icon(Icons.circle,
                                    size: 10, color: AppColors.gold),
                                Container(
                                    width: 1.5,
                                    height: 36,
                                    color: AppColors.divider),
                                Icon(Icons.location_on,
                                    size: 12, color: AppColors.textMuted),
                              ],
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Pickup',
                                      style: AppText.smallLabel),
                                  const SizedBox(height: 4),
                                  Text(r.pickupAddress,
                                      style: TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 14,
                                          height: 1.3)),
                                  const SizedBox(height: 20),
                                  const Text('Drop', style: AppText.smallLabel),
                                  const SizedBox(height: 4),
                                  Text(r.dropAddress,
                                      style: TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 14,
                                          height: 1.3)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          child: Divider(color: AppColors.divider, height: 1),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _tripStat(Icons.route,
                                '${r.distanceKm.toStringAsFixed(1)} km'),
                            _tripStat(Icons.schedule, '${r.durationMin} min'),
                            _tripStat(
                                Icons.calendar_today, _formatDate(r.dateTime)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // --- RideRouteMap (Phase 7) ---
                  // Static route preview (no live driver-location dot here —
                  // that's reserved for the active-trip view on Current
                  // Ride). Falls back to the old placeholder automatically
                  // for rides without coordinates (completed/cancelled mock
                  // rides in this dataset don't have any yet).
                  // Tappable (Phase 8) — opens the big in-app Navigation
                  // card so the driver can see the full route.
                  RideRouteMapTappable(ride: r, height: 160),
                  const SizedBox(height: 16),

                  // --- VehicleDetailsCard ---
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: cardDecoration(radius: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Vehicle', style: AppText.sectionTitle),
                        const SizedBox(height: 14),
                        _detailRow(
                            Icons.directions_car, 'Model', r.vehicleModel),
                        const SizedBox(height: 12),
                        _detailRow(Icons.pin, 'Number', r.vehicleNumber),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // --- Fare / payment summary ---
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: rideCardDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Base Fare',
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 14)),
                            Text('₹2000',
                                style: TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 16)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Distance Charge',
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 14)),
                            Text('₹${(r.fare - 2000).toStringAsFixed(0)}',
                                style: TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 16)),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Divider(color: AppColors.divider, height: 1),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Total Fare',
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 14)),
                            Text('₹${r.fare.toStringAsFixed(0)}',
                                style: TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w800)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.account_balance_wallet,
                                size: 14, color: AppColors.textMuted),
                            const SizedBox(width: 6),
                            Text(r.paymentMethod,
                                style: TextStyle(
                                    color: AppColors.textMuted, fontSize: 13)),
                          ],
                        ),
                      ],
                    ),
                  ),

                  if (r.status == RideStatus.available) ...[
                    const SizedBox(height: 24),
                    AppButton(
                      label: 'Accept Ride',
                      onPressed: () async {
                        try {
                          final res = await ApiService.post(
                              '/driver/bookings/rides/${r.id}/accept');
                          if (res.statusCode == 200) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                      content: Text('Ride Accepted')));
                              context.pop();
                            }
                          } else {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                      content: Text('Failed to accept ride')));
                            }
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text('Error accepting ride')));
                          }
                        }
                      },
                    ),
                  ] else if (r.status == RideStatus.upcoming ||
                      r.status == RideStatus.ongoing) ...[
                    const SizedBox(height: 24),
                    AppButton(
                      label: r.status == RideStatus.ongoing
                          ? 'View Current Ride'
                          : 'Start Ride',
                      onPressed: () => context.push('/rides/current'),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tripStat(IconData icon, String value) {
    return Column(
      children: [
        Icon(icon, size: 16, color: AppColors.gold),
        const SizedBox(height: 6),
        Text(value,
            style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 13,
                fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textMuted),
        const SizedBox(width: 10),
        Text(label,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
        const Spacer(),
        Text(value,
            style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _statusBadge(RideStatus status) {
    final color = switch (status) {
      RideStatus.available => AppColors.info,
      RideStatus.upcoming => AppColors.info,
      RideStatus.ongoing => AppColors.success,
      RideStatus.completed => AppColors.gold,
      RideStatus.cancelled => AppColors.error,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(20)),
      child: Text(
        status.label,
        style:
            TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inDays == 0 && dt.day == now.day) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.isNegative) return 'Upcoming';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
