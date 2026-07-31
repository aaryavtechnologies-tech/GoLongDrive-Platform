import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/mock_data.dart';
import '../../core/models/ride.dart';
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
  static const _requestSeconds = 15;
  late final AnimationController _timerController;
  bool _resolved = false;

  @override
  void initState() {
    super.initState();
    _timerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: _requestSeconds),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) _decline(auto: true);
      });
    _timerController.forward();
  }

  @override
  void dispose() {
    _timerController.dispose();
    super.dispose();
  }

  void _accept(Ride ride) {
    if (_resolved) return;
    _resolved = true;
    _timerController.stop();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Ride accepted')),
    );
    context.pushReplacement('/rides/details', extra: {'rideId': ride.id});
  }

  void _decline({bool auto = false}) {
    if (_resolved) return;
    _resolved = true;
    _timerController.stop();
    if (!mounted) return;
    if (auto) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Request expired')),
      );
    }
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final args = GoRouterState.of(context).extra as Map<String, dynamic>?;
    final rideId = args?['rideId'] as String?;

    Ride? ride;
    if (rideId != null) {
      for (final r in MockData.rides) {
        if (r.id == rideId) {
          ride = r;
          break;
        }
      }
    }

    if (ride == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Center(
            child: Text('No ride request found', style: TextStyle(color: AppColors.textMuted)),
          ),
        ),
      );
    }

    final r = ride;

    return WillPopScope(
      onWillPop: () async {
        _decline();
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
                          Text('₹${r.fare.toStringAsFixed(0)}', style: AppText.balanceAmount.copyWith(color: AppColors.gold)),
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
                                      Text(r.customerName,
                                          style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700)),
                                      Row(
                                        children: [
                                          const Icon(Icons.star, size: 13, color: AppColors.gold),
                                          const SizedBox(width: 3),
                                          Text(r.customerRating.toStringAsFixed(1),
                                              style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                _tripStat(Icons.route, '${r.distanceKm.toStringAsFixed(1)} km'),
                                const SizedBox(width: 14),
                                _tripStat(Icons.schedule, '${r.durationMin} min'),
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
                                      Text(r.pickupAddress,
                                          style: TextStyle(color: AppColors.textPrimary, fontSize: 14, height: 1.3)),
                                      const SizedBox(height: 20),
                                      const Text('Drop', style: AppText.smallLabel),
                                      const SizedBox(height: 4),
                                      Text(r.dropAddress,
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
                              Text(r.paymentMethod, style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
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
                        onPressed: () => _decline(),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: AppButton(
                        label: 'Accept',
                        onPressed: () => _accept(r),
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
