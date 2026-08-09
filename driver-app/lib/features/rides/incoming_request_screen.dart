import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/data/socket_service.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/app_button.dart';

/// The "New Ride Request" screen — shown when a ride request comes in
/// while the driver is online. Countdown ring auto-declines if the driver
/// doesn't respond in time, matching the standard driver-app pattern.
///
/// Reads `rideId` from route `extra` (same convention as `RideDetailsScreen`)
/// and looks it up in `MockData.rides`. Purely local UI state — there's no
/// dispatch/matching backend yet (see BACKEND_API_SPEC.md), so "Accept"
/// just routes to Ride Details for that ride and "Decline"/timeout pops
/// back to wherever this was opened from.
class IncomingRequestScreen extends StatefulWidget {
  const IncomingRequestScreen({super.key});

  @override
  State<IncomingRequestScreen> createState() => _IncomingRequestScreenState();
}

class _IncomingRequestScreenState extends State<IncomingRequestScreen>
    with SingleTickerProviderStateMixin {
  static const _requestSeconds = 120;
  late final AnimationController _timerController;
  bool _resolved = false;
  bool _loading = false;
  StreamSubscription? _rideAccSub;
  dynamic _booking;

  bool _showMissedState = false;
  String _missedReason = '';

  @override
  void initState() {
    super.initState();
    _timerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: _requestSeconds),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) _showMissed('Request Expired');
      });
    _timerController.forward();

    // Close screen automatically if someone else accepts the ride
    _rideAccSub = SocketService.onRideAccepted.listen((bookingIdStr) {
      if (_booking != null && _booking['_id'] == bookingIdStr && mounted) {
        if (!_resolved) {
          _showMissed('Another Driver Accepted');
        }
      }
    });
  }

  void _showMissed(String reason) {
    if (_resolved) return;
    _resolved = true;
    _timerController.stop();
    if (mounted) {
      setState(() {
        _showMissedState = true;
        _missedReason = reason;
      });
    }
  }

  @override
  void dispose() {
    _timerController.dispose();
    _rideAccSub?.cancel();
    super.dispose();
  }

  Future<void> _accept(dynamic booking) async {
    if (_resolved) return;
    
    setState(() {
      _loading = true;
    });

    try {
      final res = await ApiService.post('/driver/rides/${booking['_id']}/accept');
      
      if (!mounted) return;
      setState(() => _loading = false);

      if (res.statusCode == 200) {
        _resolved = true;
        _timerController.stop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ride accepted successfully!')),
        );
        // Replace with current ride screen
        context.pushReplacement('/tabs?tab=1'); // or /rides/current directly
      } else {
        _showMissed('Ride no longer available');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error')),
      );
    }
  }

  void _decline() {
    if (_resolved) return;
    _resolved = true;
    _timerController.stop();
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final args = GoRouterState.of(context).extra as Map<String, dynamic>?;
    _booking = args?['booking'];

    if (_booking == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Center(
            child: Text('No ride request found', style: TextStyle(color: AppColors.textMuted)),
          ),
        ),
      );
    }

    if (_showMissedState) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.error.withOpacity(0.1),
                  ),
                  child: const Icon(Icons.timer_off_outlined, color: AppColors.error, size: 40),
                ),
                const SizedBox(height: 24),
                Text('Missed Ride', style: AppText.cardHeadline.copyWith(fontSize: 24)),
                const SizedBox(height: 12),
                Text(
                  _missedReason,
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  child: AppButton(
                    label: 'Back to Dashboard',
                    onPressed: () => context.pop(),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final b = _booking!;
    final customer = b['customer'] ?? {};
    final estimatedFare = b['estimatedFare'] ?? 0;
    final pickupAddress = b['pickupLocation']?['address'] ?? 'Unknown Pickup';
    final dropAddress = b['dropoffLocation']?['address'] ?? 'Unknown Drop';
    final customerName = customer['fullName'] ?? 'Customer';
    final distanceKm = (b['estimatedDistance'] ?? 0) / 1000;
    final paymentMethod = b['paymentMethod'] ?? 'Online';

    return WillPopScope(
      onWillPop: () async {
        if (!_loading) _decline();
        return false;
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.gold),
                        ),
                        const SizedBox(width: 10),
                        const Text('New Ride Request', style: AppText.cardHeadline),
                      ],
                    ),
                    AnimatedBuilder(
                      animation: _timerController,
                      builder: (context, _) {
                        final remaining = (_requestSeconds * (1 - _timerController.value)).ceil();
                        return Stack(
                          alignment: Alignment.center,
                          children: [
                            SizedBox(
                              width: 40,
                              height: 40,
                              child: CircularProgressIndicator(
                                value: 1 - _timerController.value,
                                strokeWidth: 3,
                                backgroundColor: AppColors.surfaceAlt2,
                                valueColor: AlwaysStoppedAnimation(
                                  remaining <= 5 ? AppColors.error : AppColors.gold,
                                ),
                              ),
                            ),
                            Text('$remaining',
                                style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w700)),
                          ],
                        );
                      },
                    ),
                  ],
                ),
                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(height: 8),
                          Text('₹${estimatedFare}', style: AppText.balanceAmount.copyWith(color: AppColors.gold)),
                          const SizedBox(height: 4),
                          Text('Estimated fare', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                          const SizedBox(height: 24),

                          // --- Customer card ---
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: cardDecoration(radius: 20),
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.goldTint),
                                  child: const Icon(Icons.person, color: AppColors.gold, size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(customerName,
                                          style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700)),
                                      Row(
                                        children: [
                                          const Icon(Icons.star, size: 13, color: AppColors.gold),
                                          const SizedBox(width: 3),
                                          Text('4.8',
                                              style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                _tripStat(Icons.route, '${distanceKm.toStringAsFixed(1)} km'),
                                const SizedBox(width: 14),
                                _tripStat(Icons.schedule, 'N/A'),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),

                          // --- Pickup / drop ---
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
                                      const Text('Pickup', style: AppText.smallLabel),
                                      const SizedBox(height: 4),
                                      Text(pickupAddress,
                                          style: TextStyle(color: AppColors.textPrimary, fontSize: 14, height: 1.3)),
                                      const SizedBox(height: 20),
                                      const Text('Drop', style: AppText.smallLabel),
                                      const SizedBox(height: 4),
                                      Text(dropAddress,
                                          style: TextStyle(color: AppColors.textPrimary, fontSize: 14, height: 1.3)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Icon(Icons.account_balance_wallet_outlined, size: 14, color: AppColors.textMuted),
                              const SizedBox(width: 6),
                              Text(paymentMethod, style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Decline',
                        variant: AppButtonVariant.secondary,
                        onPressed: _loading ? null : () => _decline(),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: AppButton(
                        label: _loading ? 'Accepting...' : 'Accept',
                        onPressed: _loading ? null : () => _accept(b),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _tripStat(IconData icon, String value) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: AppColors.gold),
        const SizedBox(height: 3),
        Text(value, style: TextStyle(color: AppColors.textPrimary, fontSize: 11, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
