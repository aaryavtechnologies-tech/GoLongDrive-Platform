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

/// Complete Ride History & Details Screen for Driver App
///
/// Features:
/// - Real-time & Historical booking details retrieval
/// - Passenger card with direct dialer
/// - Route breakdown with distances and timestamps
/// - Tappable Map Route preview
/// - Comprehensive Fare & Net Driver Earnings breakdown
/// - Direct Help & Support escalation button for this booking
class RideDetailsScreen extends StatefulWidget {
  const RideDetailsScreen({super.key});

  @override
  State<RideDetailsScreen> createState() => _RideDetailsScreenState();
}

class _RideDetailsScreenState extends State<RideDetailsScreen> {
  Ride? _ride;
  Map<String, dynamic>? _earning;
  Map<String, dynamic>? _rawBooking;
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
    } else if (passedRide is Map<String, dynamic>) {
      if (mounted) {
        setState(() {
          _rawBooking = passedRide;
          _ride = Ride.fromJson(passedRide);
          _earning = passedRide['earning'];
          _isLoading = false;
        });
      }
    }

    final targetId = rideId ?? _ride?.id;
    if (targetId != null && targetId.isNotEmpty) {
      // First check mock data if available
      for (final r in MockData.rides) {
        if (r.id == targetId) {
          if (mounted && _ride == null) {
            setState(() { _ride = r; _isLoading = false; });
          }
          break;
        }
      }

      // Fetch live details from backend API
      try {
        final res = await ApiService.get('/driver/bookings/rides/$targetId');
        if (res.statusCode == 200) {
          final decoded = jsonDecode(res.body);
          if (decoded is Map<String, dynamic> && decoded['data'] != null) {
            final data = decoded['data'];
            final bookingJson = data['booking'] ?? data;
            if (mounted) {
              setState(() {
                _rawBooking = Map<String, dynamic>.from(bookingJson);
                _ride = Ride.fromJson(_rawBooking!);
                _earning = data['earning'];
                _isLoading = false;
              });
              return;
            }
          }
        }
      } catch (e) {
        debugPrint('Failed to load driver ride details from API: $e');
      }
    }

    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Ride Details'),
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.gold),
        ),
      );
    }

    if (_ride == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Ride Details'),
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.directions_car_outlined, size: 48, color: AppColors.textMuted),
              const SizedBox(height: 12),
              Text('Ride details not found',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 16)),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () => context.pop(),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    final r = _ride!;
    final double netEarnings = _earning?['driverEarnings'] != null
        ? (_earning!['driverEarnings'] as num).toDouble()
        : (r.fare * 0.9);
    final double platformFee = _earning?['platformFee'] != null
        ? (_earning!['platformFee'] as num).toDouble()
        : (r.fare * 0.1);

    final bookingId = _rawBooking?['bookingId'] ?? r.id;
    final tripType = _rawBooking?['tripType'] ?? 'One Way';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // --- Ride Header ---
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 20, 8),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: 4),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Ride Details', style: AppText.cardHeadline),
                      Text(
                        'Booking #$bookingId',
                        style: TextStyle(color: AppColors.gold, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const Spacer(),
                  _statusBadge(r.status, r.rawStatus),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                children: [
                  // --- Route Map Preview ---
                  RideRouteMapTappable(ride: r, height: 160),
                  const SizedBox(height: 16),

                  // --- Passenger Details Card ---
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: cardDecoration(radius: 20),
                    child: Row(
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.goldTint,
                          ),
                          child: const Icon(Icons.person, color: AppColors.gold, size: 26),
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
                                  const Icon(Icons.star, size: 14, color: AppColors.gold),
                                  const SizedBox(width: 4),
                                  Text(r.customerRating.toStringAsFixed(1),
                                      style: TextStyle(
                                          color: AppColors.textSecondary,
                                          fontSize: 13)),
                                  const SizedBox(width: 12),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceAlt2,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(tripType,
                                        style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        if (r.customerPhone.isNotEmpty)
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
                              child: const Icon(Icons.call, color: AppColors.gold, size: 20),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // --- Route & Location Card ---
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
                                const Icon(Icons.circle, size: 10, color: AppColors.gold),
                                Container(
                                    width: 1.5,
                                    height: 38,
                                    color: AppColors.divider),
                                Icon(Icons.location_on, size: 12, color: AppColors.error),
                              ],
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Pickup Location', style: AppText.smallLabel),
                                  const SizedBox(height: 4),
                                  Text(r.pickupAddress,
                                      style: TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 14,
                                          height: 1.3)),
                                  const SizedBox(height: 18),
                                  Text('Dropoff Location', style: AppText.smallLabel),
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
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _tripStat(Icons.route, '${r.distanceKm.toStringAsFixed(1)} km', 'Distance'),
                            _tripStat(Icons.schedule, '${r.durationMin} min', 'Est. Time'),
                            _tripStat(Icons.calendar_today, _formatDate(r.dateTime), 'Trip Date'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // --- Net Driver Earnings Card (Highlighted) ---
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.gold.withValues(alpha: 0.2),
                          AppColors.gold.withValues(alpha: 0.05),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: AppColors.gold.withValues(alpha: 0.2),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.account_balance_wallet, color: AppColors.gold, size: 20),
                                ),
                                const SizedBox(width: 10),
                                const Text(
                                  'Your Net Earning',
                                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            Text(
                              '₹${netEarnings.toStringAsFixed(0)}',
                              style: const TextStyle(
                                color: AppColors.gold,
                                fontSize: 26,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Gross Total Fare', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                            Text('₹${r.fare.toStringAsFixed(0)}',
                                style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Platform Fee (10%)', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                            Text('-₹${platformFee.toStringAsFixed(0)}',
                                style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Divider(color: AppColors.gold.withValues(alpha: 0.2), height: 1),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  r.paymentMethod.toLowerCase() == 'cash'
                                      ? Icons.money
                                      : Icons.credit_card,
                                  size: 16,
                                  color: AppColors.gold,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Payment: ${r.paymentMethod}',
                                  style: TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.success.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                r.paymentStatus.toUpperCase(),
                                style: const TextStyle(color: AppColors.success, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // --- Vehicle & Trip Specs Card ---
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: cardDecoration(radius: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Vehicle & Booking Details', style: AppText.sectionTitle),
                        const SizedBox(height: 14),
                        _detailRow(Icons.directions_car, 'Vehicle Type', r.vehicleModel.isNotEmpty ? r.vehicleModel : 'Sedan'),
                        const SizedBox(height: 12),
                        _detailRow(Icons.confirmation_number, 'Booking Number', bookingId),
                        if (_rawBooking?['ridePin'] != null) ...[
                          const SizedBox(height: 12),
                          _detailRow(Icons.pin, 'Ride Start PIN', _rawBooking!['ridePin'].toString()),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // --- Support Escalation Card ---
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: cardDecoration(radius: 20, bg: AppColors.surfaceAlt),
                    child: Row(
                      children: [
                        const Icon(Icons.support_agent, color: AppColors.gold, size: 22),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Issue with this trip?',
                                  style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 13)),
                              Text('File a ticket to support team',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            context.push('/profile/support');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.gold,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            elevation: 0,
                          ),
                          child: const Text('Contact Support', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ],
                    ),
                  ),

                  // --- Ride Action Buttons ---
                  if (r.status == RideStatus.available) ...[
                    const SizedBox(height: 24),
                    AppButton(
                      label: 'Accept Ride',
                      onPressed: () async {
                        try {
                          final res = await ApiService.post('/driver/bookings/rides/${r.id}/accept');
                          if (res.statusCode == 200) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Ride Accepted!'), backgroundColor: AppColors.success),
                              );
                              context.pop();
                            }
                          } else {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Failed to accept ride'), backgroundColor: Colors.red),
                              );
                            }
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
                            );
                          }
                        }
                      },
                    ),
                  ] else if (r.status == RideStatus.upcoming || r.status == RideStatus.ongoing) ...[
                    const SizedBox(height: 24),
                    AppButton(
                      label: r.status == RideStatus.ongoing ? 'View Active Ride' : 'Start Journey',
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

  Widget _tripStat(IconData icon, String value, String subtitle) {
    return Column(
      children: [
        Icon(icon, size: 18, color: AppColors.gold),
        const SizedBox(height: 6),
        Text(value,
            style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 13,
                fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(subtitle,
            style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 10)),
      ],
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textMuted),
        const SizedBox(width: 10),
        Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        const Spacer(),
        Text(value,
            style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 13,
                fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _statusBadge(RideStatus status, String? rawStatus) {
    Color color = AppColors.gold;
    String label = rawStatus ?? status.label;

    final s = (rawStatus ?? status.name).toLowerCase();
    if (s == 'searching driver' || s == 'available' || s == 'pending') {
      color = AppColors.info;
      label = 'Available';
    } else if (['driver_accepted', 'driver_arriving', 'driver_arrived', 'confirmed'].contains(s) ||
        ['Driver Accepted', 'Driver Arriving', 'Driver Arrived', 'Confirmed'].contains(rawStatus)) {
      color = AppColors.info;
      label = 'Upcoming';
    } else if (s == 'trip started' || s == 'in_progress' || s == 'awaiting payment') {
      color = AppColors.success;
      label = 'Ongoing';
    } else if (s == 'trip completed' || s == 'completed') {
      color = AppColors.gold;
      label = 'Completed';
    } else if (s.startsWith('cancel')) {
      color = AppColors.error;
      label = 'Cancelled';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inDays == 0 && dt.day == now.day) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
