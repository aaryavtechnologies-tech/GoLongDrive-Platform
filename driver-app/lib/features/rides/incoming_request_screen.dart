import 'dart:async';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/data/socket_service.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/app_button.dart';

/// The "New Ride Request" screen — shown when a ride request comes in for
/// this driver (both broadcast and fallback-assigned).
///
/// Behaviour:
///  • 120-second countdown ring.  Auto-declines on expiry.
///  • [ride:request_taken] socket event → shows "Another Driver Accepted" state.
///  • Sound is played when this screen opens (caller passes sound-already-played
///    flag if the dashboard already played it, but we play it here too for safety).
class IncomingRequestScreen extends StatefulWidget {
  const IncomingRequestScreen({super.key});

  @override
  State<IncomingRequestScreen> createState() => _IncomingRequestScreenState();
}

class _IncomingRequestScreenState extends State<IncomingRequestScreen>
    with SingleTickerProviderStateMixin {
  static const _requestSeconds = 120;
  late final AnimationController _timerController;
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _resolved = false;
  bool _loading = false;
  StreamSubscription? _rideTakenSub;
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

    // Play notification sound
    _playSound();

    // Close screen if another driver accepted this same ride
    _rideTakenSub = SocketService.onRideTaken.listen((takenBookingId) {
      if (_booking != null) {
        final myBookingId =
            (_booking['bookingId'] ?? _booking['_id'])?.toString();
        if (myBookingId == takenBookingId && mounted) {
          if (!_resolved) _showMissed('Another Driver Accepted');
        }
      }
    });
  }

  Future<void> _playSound() async {
    try {
      await _audioPlayer.play(AssetSource('sounds/ride_request.mp3'));
    } catch (e) {
      debugPrint('IncomingRequest: sound error: $e');
    }
  }

  void _showMissed(String reason) {
    if (_resolved) return;
    _resolved = true;
    _timerController.stop();
    _audioPlayer.stop();
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
    _rideTakenSub?.cancel();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _accept(dynamic booking) async {
    if (_resolved) return;
    setState(() => _loading = true);

    // Use _id (MongoDB ObjectId) for the API call
    final bookingMongoId = booking['_id']?.toString() ?? '';

    try {
      final res = await ApiService.post('/driver/rides/$bookingMongoId/accept');

      if (!mounted) return;
      setState(() => _loading = false);

      if (res.statusCode == 200) {
        _resolved = true;
        _timerController.stop();
        _audioPlayer.stop();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Ride accepted successfully!')),
          );
          // Navigate to current ride / dashboard
          context.pushReplacement('/tabs?tab=1');
        }
      } else {
        _showMissed('Ride no longer available');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error. Please try again.')),
      );
    }
  }

  Future<void> _decline(dynamic booking) async {
    if (_resolved) return;
    _resolved = true;
    _timerController.stop();
    _audioPlayer.stop();

    // Fire-and-forget reject API call
    final bookingMongoId = booking?['_id']?.toString();
    if (bookingMongoId != null) {
      ApiService.post('/driver/rides/$bookingMongoId/reject',
              body: {'reason': 'Manually declined by driver'})
          .then((_) {}, onError: (e) => debugPrint('Reject API error: $e'));
    }

    if (mounted) context.pop();
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
            child: Text('No ride request found',
                style: TextStyle(color: AppColors.textMuted)),
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
                  child: const Icon(Icons.timer_off_outlined,
                      color: AppColors.error, size: 40),
                ),
                const SizedBox(height: 24),
                Text('Missed Ride',
                    style: AppText.cardHeadline.copyWith(fontSize: 24)),
                const SizedBox(height: 12),
                Text(
                  _missedReason,
                  style: TextStyle(
                      color: AppColors.textSecondary, fontSize: 16),
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

    // ── FIXED BUG 8: Backend sends pickupAddress / dropAddress directly ─────
    final pickupAddress =
        b['pickupAddress'] ?? b['pickupLocation']?['address'] ?? 'Unknown Pickup';
    final dropAddress =
        b['dropAddress'] ?? b['dropoffLocation']?['address'] ?? 'Unknown Drop';

    final estimatedFare = b['estimatedFare'] ?? b['finalFare'] ?? 0;
    final customerName = customer['fullName'] ?? 'Customer';

    // ── FIXED BUG 8b: Backend sends estimatedDistance in km already ─────────
    final distanceKm = (b['estimatedDistance'] ?? 0).toDouble();

    final paymentMethod = b['paymentMethod'] ?? 'Cash';
    final vehicleType = b['vehicleType'] ?? 'N/A';
    final pickupDate = b['pickupDate'] != null
        ? DateTime.tryParse(b['pickupDate'].toString())
        : null;
    final pickupTime = b['pickupTime'] ?? '';

    return WillPopScope(
      onWillPop: () async {
        if (!_loading) _decline(b);
        return false;
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
            child: Column(
              children: [
                // ── Header row with countdown ──────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: const BoxDecoration(
                              shape: BoxShape.circle, color: AppColors.gold),
                        ),
                        const SizedBox(width: 10),
                        const Text('New Ride Request',
                            style: AppText.cardHeadline),
                      ],
                    ),
                    AnimatedBuilder(
                      animation: _timerController,
                      builder: (context, _) {
                        final remaining =
                            (_requestSeconds * (1 - _timerController.value))
                                .ceil();
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
                                  remaining <= 10
                                      ? AppColors.error
                                      : AppColors.gold,
                                ),
                              ),
                            ),
                            Text('$remaining',
                                style: TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700)),
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
                          Text('₹${estimatedFare.toString()}',
                              style: AppText.balanceAmount
                                  .copyWith(color: AppColors.gold)),
                          const SizedBox(height: 4),
                          Text('Estimated fare',
                              style: TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 13)),
                          const SizedBox(height: 8),
                          // Vehicle type badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.goldTint,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(vehicleType,
                                style: TextStyle(
                                    color: AppColors.gold,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600)),
                          ),
                          const SizedBox(height: 24),

                          // ── Customer card ─────────────────────────────────
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: cardDecoration(radius: 20),
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.goldTint),
                                  child: const Icon(Icons.person,
                                      color: AppColors.gold, size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(customerName,
                                          style: TextStyle(
                                              color: AppColors.textPrimary,
                                              fontSize: 14,
                                              fontWeight: FontWeight.w700)),
                                      if (pickupDate != null || pickupTime.isNotEmpty)
                                        Text(
                                          pickupDate != null
                                              ? '${pickupDate.day}/${pickupDate.month}/${pickupDate.year} $pickupTime'
                                              : pickupTime,
                                          style: TextStyle(
                                              color: AppColors.textSecondary,
                                              fontSize: 12),
                                        ),
                                    ],
                                  ),
                                ),
                                _tripStat(Icons.route,
                                    '${distanceKm.toStringAsFixed(1)} km'),
                                const SizedBox(width: 14),
                                _tripStat(Icons.people,
                                    '${b['numberOfPassengers'] ?? 1}'),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),

                          // ── Pickup / drop ─────────────────────────────────
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: cardDecoration(radius: 20),
                            child: Row(
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
                                        size: 12,
                                        color: AppColors.textMuted),
                                  ],
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text('Pickup',
                                          style: AppText.smallLabel),
                                      const SizedBox(height: 4),
                                      Text(pickupAddress,
                                          style: TextStyle(
                                              color: AppColors.textPrimary,
                                              fontSize: 14,
                                              height: 1.3)),
                                      const SizedBox(height: 20),
                                      const Text('Drop',
                                          style: AppText.smallLabel),
                                      const SizedBox(height: 4),
                                      Text(dropAddress,
                                          style: TextStyle(
                                              color: AppColors.textPrimary,
                                              fontSize: 14,
                                              height: 1.3)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Icon(Icons.account_balance_wallet_outlined,
                                  size: 14, color: AppColors.textMuted),
                              const SizedBox(width: 6),
                              Text(paymentMethod,
                                  style: TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 13)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // ── Action buttons ─────────────────────────────────────────
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Decline',
                        variant: AppButtonVariant.secondary,
                        onPressed: _loading ? null : () => _decline(b),
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
        Text(value,
            style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 11,
                fontWeight: FontWeight.w600)),
      ],
    );
  }
}
