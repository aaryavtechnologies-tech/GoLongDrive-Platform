// lib/screens/booking/driver_assigned_screen.dart
//
// "Finding Driver" screen — shown immediately after a booking is confirmed.
//
// Strategy:
//  1. Primary: Listen for `booking:driver_assigned` socket event (instant)
//  2. Fallback: Poll `GET /rides/:bookingId` every 5 seconds
//  3. Timeout: After 10 minutes show "No driver found" message
//
// When a driver is assigned → navigate to /boarding-pass.

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/data/api_client.dart';
import '../../core/services/booking_service.dart';
import '../../core/services/socket_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class DriverAssignedScreen extends StatefulWidget {
  const DriverAssignedScreen({super.key});

  @override
  State<DriverAssignedScreen> createState() => _DriverAssignedScreenState();
}

class _DriverAssignedScreenState extends State<DriverAssignedScreen>
    with TickerProviderStateMixin {
  // ── Passed from ConfirmRideScreen ──────────────────────────────────────────
  Map<String, dynamic>? _args;
  String? _bookingId;
  String? _mongoBookingId;

  // ── State ──────────────────────────────────────────────────────────────────
  bool _driverFound = false;
  bool _timedOut = false;
  bool _noDriverAvailable = false;
  Map<String, dynamic>? _driverData;

  // ── Timers / subscriptions ─────────────────────────────────────────────────
  Timer? _pollTimer;
  Timer? _timeoutTimer;
  StreamSubscription? _driverAssignedSub;
  StreamSubscription? _noDriverSub;

  // ── Animation ──────────────────────────────────────────────────────────────
  late final AnimationController _pulseController;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..repeat();

    // Read args in next frame (ModalRoute not available yet in initState)
    WidgetsBinding.instance.addPostFrameCallback((_) => _init());
  }

  void _init() {
    _args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (_args == null) return;

    _bookingId = _args!['bookingId']?.toString(); // e.g., "CAB-20260829-0001"
    _mongoBookingId =
        (_args!['booking'] as Map<String, dynamic>?)?['_id']?.toString();

    // Subscribe to real-time driver assignment (socket)
    _driverAssignedSub = UserSocketService.onDriverAssigned.listen((data) {
      if (data['bookingId'] == _bookingId) {
        _onDriverAssigned(data['driver'] as Map<String, dynamic>?);
      }
    });

    // Subscribe to no-driver event
    _noDriverSub = UserSocketService.onNoDriver.listen((data) {
      if (data['bookingId'] == _bookingId && mounted) {
        setState(() => _noDriverAvailable = true);
      }
    });

    // Fallback: poll every 5 seconds
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) => _pollStatus());

    // Overall timeout: 10 minutes
    _timeoutTimer = Timer(const Duration(minutes: 10), () {
      if (!_driverFound && mounted) {
        setState(() => _timedOut = true);
        _cleanup();
      }
    });
  }

  /// Called when we get a driver assigned — either via socket or poll
  void _onDriverAssigned(Map<String, dynamic>? driver) {
    if (_driverFound) return;
    _driverFound = true;
    _cleanup();
    if (mounted) {
      setState(() => _driverData = driver);
      // Short delay so user can see the "Driver Found!" state before navigating
      Future.delayed(const Duration(seconds: 2), () {
        if (!mounted) return;
        final args = Map<String, dynamic>.from(_args!);
        if (driver != null) args['driverInfo'] = driver;
        Navigator.of(context).pushReplacementNamed('/boarding-pass', arguments: args);
      });
    }
  }

  /// Poll the booking status from the API
  Future<void> _pollStatus() async {
    if (_driverFound || _timedOut || _mongoBookingId == null) return;
    try {
      final result = await BookingService.getRideDetails(_mongoBookingId!);
      final status = result['rideStatus']?.toString() ?? '';
      // Any of these statuses means a driver has been assigned
      if (['Driver Accepted', 'Driver Assigned', 'DRIVER_ASSIGNED',
          'DRIVER_ACCEPTED', 'driver_accepted', 'driver_assigned']
          .contains(status)) {
        final driver = result['driver'] as Map<String, dynamic>?;
        _onDriverAssigned(driver);
      }
    } catch (e) {
      debugPrint('DriverAssignedScreen poll error: $e');
    }
  }

  void _cleanup() {
    _pollTimer?.cancel();
    _timeoutTimer?.cancel();
    _driverAssignedSub?.cancel();
    _noDriverSub?.cancel();
  }

  @override
  void dispose() {
    _cleanup();
    _pulseController.dispose();
    super.dispose();
  }

  // ── UI ─────────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (_timedOut) return _buildTimeoutState(colors);
    if (_noDriverAvailable) return _buildNoDriverState(colors);
    if (_driverFound && _driverData != null) return _buildFoundState(colors);
    return _buildSearchingState(colors);
  }

  Widget _buildSearchingState(AppColorPalette colors) {
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(),

              // Animated sweeping radar rings
              SizedBox(
                width: 280,
                height: 280,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer Ring (Phase 0.0)
                    _buildRippleRing(0.0),
                    // Middle Ring (Phase 0.33)
                    _buildRippleRing(0.33),
                    // Inner Ring (Phase 0.66)
                    _buildRippleRing(0.66),
                    
                    // Center glowing icon
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: colors.surface,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primaryGold.withValues(alpha: 0.3),
                            blurRadius: 20,
                            spreadRadius: 5,
                          ),
                        ],
                        border: Border.all(
                          color: AppColors.primaryGold.withValues(alpha: 0.8),
                          width: 2,
                        ),
                      ),
                      child: const Icon(
                        Icons.directions_car_rounded,
                        color: AppColors.primaryGold,
                        size: 42,
                      )
                          .animate(onPlay: (c) => c.repeat(reverse: true))
                          .scale(begin: const Offset(0.9, 0.9), end: const Offset(1.1, 1.1), duration: 1000.ms, curve: Curves.easeInOut),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 50),

              Text(
                'Finding Your Driver',
                style: AppTextStyles.largeHeading.copyWith(
                  color: colors.textPrimary,
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
                textAlign: TextAlign.center,
              )
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .shimmer(duration: 2000.ms, color: AppColors.primaryGold.withValues(alpha: 0.3)),

              const SizedBox(height: 16),

              Text(
                'Searching for the best available driver near you.\nPlease wait a moment...',
                style: AppTextStyles.body.copyWith(
                    color: colors.textSecondary, height: 1.6, fontSize: 15),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 36),

              // Booking reference pill
              if (_bookingId != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: colors.surfaceElevated,
                    borderRadius: BorderRadius.circular(30), // Pill shape
                    border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.confirmation_num_outlined, size: 16, color: colors.textSecondary),
                      const SizedBox(width: 8),
                      Text(
                        'Booking: ',
                        style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                      ),
                      Text(
                        _bookingId!,
                        style: AppTextStyles.subtitle.copyWith(
                          color: AppColors.primaryGold,
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                )
                    .animate()
                    .fadeIn(delay: 300.ms)
                    .slideY(begin: 0.5, end: 0, duration: 400.ms),

              const Spacer(),

              // Animated dots progress indicator using flutter_animate
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(3, (i) {
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 6),
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primaryGold,
                    ),
                  )
                      .animate(onPlay: (c) => c.repeat())
                      .scale(
                        begin: const Offset(0.5, 0.5),
                        end: const Offset(1.2, 1.2),
                        duration: 600.ms,
                        curve: Curves.easeInOut,
                        delay: (i * 200).ms,
                      )
                      .then(duration: 600.ms)
                      .scale(
                        begin: const Offset(1.2, 1.2),
                        end: const Offset(0.5, 0.5),
                        curve: Curves.easeInOut,
                      );
                }),
              ),

              const SizedBox(height: 28),

              Text(
                'Please keep the app open',
                style: AppTextStyles.caption.copyWith(
                  color: colors.textSecondary,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),

              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRippleRing(double delayFactor) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        double phase = (_pulseController.value + delayFactor) % 1.0;
        double size = 90 + (190 * phase);
        double opacity = 1.0 - phase;
        opacity = Curves.easeOut.transform(opacity);

        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: AppColors.primaryGold.withValues(alpha: 0.5 * opacity),
              width: 1.5 + (1.5 * opacity),
            ),
            color: AppColors.primaryGold.withValues(alpha: 0.05 * opacity),
          ),
        );
      },
    );
  }

  Widget _buildFoundState(AppColorPalette colors) {
    final driver = _driverData!;
    final driverName = driver['fullName'] ?? 'Your Driver';
    final vehicle = driver['vehicle'] as Map<String, dynamic>? ?? {};
    final vehicleModel = vehicle['model'] ?? vehicle['type'] ?? 'Vehicle';

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.green.withOpacity(0.12),
                ),
                child: const Icon(Icons.check_circle_rounded,
                    color: Colors.green, size: 60),
              )
                  .animate()
                  .scale(
                      begin: const Offset(0, 0), duration: 400.ms,
                      curve: Curves.elasticOut),

              const SizedBox(height: 24),

              Text('Driver Found!',
                  style: AppTextStyles.largeHeading.copyWith(
                      color: colors.textPrimary,
                      fontSize: 26,
                      fontWeight: FontWeight.w700))
                  .animate()
                  .fadeIn(delay: 200.ms),

              const SizedBox(height: 8),
              Text(driverName,
                  style: AppTextStyles.subtitle.copyWith(
                      color: AppColors.primaryGold,
                      fontWeight: FontWeight.w600))
                  .animate()
                  .fadeIn(delay: 300.ms),

              const SizedBox(height: 4),
              Text(vehicleModel,
                  style: AppTextStyles.body
                      .copyWith(color: colors.textSecondary))
                  .animate()
                  .fadeIn(delay: 400.ms),

              const SizedBox(height: 24),
              const CircularProgressIndicator(
                valueColor:
                    AlwaysStoppedAnimation<Color>(AppColors.primaryGold),
                strokeWidth: 2,
              ),
              const SizedBox(height: 12),
              Text('Loading your boarding pass...',
                  style: AppTextStyles.caption
                      .copyWith(color: colors.textSecondary)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimeoutState(AppColorPalette colors) {
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primaryGold.withValues(alpha: 0.1),
                ),
                child: Icon(Icons.timer_off_outlined, color: AppColors.primaryGold, size: 48),
              ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),
              
              const SizedBox(height: 24),
              Text('Taking Longer Than Expected',
                  style: AppTextStyles.largeHeading.copyWith(
                      color: colors.textPrimary,
                      fontSize: 22,
                      fontWeight: FontWeight.w700),
                  textAlign: TextAlign.center)
                  .animate().fadeIn(delay: 100.ms).slideY(begin: 0.2, end: 0),
                  
              const SizedBox(height: 12),
              Text(
                'Our team is manually assigning a driver for you. You will receive a confirmation shortly.',
                style: AppTextStyles.body
                    .copyWith(color: colors.textSecondary, height: 1.5),
                textAlign: TextAlign.center,
              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2, end: 0),
              
              const SizedBox(height: 40),
              if (_bookingId != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: colors.surfaceElevated,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.3)),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryGold.withValues(alpha: 0.05),
                        blurRadius: 10,
                        spreadRadius: 2,
                      )
                    ],
                  ),
                  child: Column(
                    children: [
                      Text('Keep your booking ID',
                          style: AppTextStyles.caption
                              .copyWith(color: colors.textSecondary)),
                      const SizedBox(height: 4),
                      Text(_bookingId!,
                          style: AppTextStyles.subtitle.copyWith(
                            color: AppColors.primaryGold,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                          )),
                    ],
                  ),
                ).animate().fadeIn(delay: 300.ms).scale(begin: const Offset(0.95, 0.95)),
                
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).popUntil(
                    (route) => route.settings.name == '/home' || route.isFirst,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGold,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    elevation: 4,
                  ),
                  child: const Text('Back to Home',
                      style: TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 16)),
                ),
              ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2, end: 0),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNoDriverState(AppColorPalette colors) {
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.error.withValues(alpha: 0.1),
                ),
                child: Icon(Icons.car_crash_outlined, color: AppColors.error, size: 48),
              ).animate().shake(duration: 500.ms, hz: 3),
              
              const SizedBox(height: 24),
              Text('No Drivers Available',
                  style: AppTextStyles.largeHeading.copyWith(
                      color: colors.textPrimary,
                      fontSize: 22,
                      fontWeight: FontWeight.w700),
                  textAlign: TextAlign.center)
                  .animate().fadeIn(delay: 100.ms).slideY(begin: 0.2, end: 0),
                  
              const SizedBox(height: 12),
              Text(
                'All drivers are currently busy. Our team will manually assign a driver for your booking. Please check back shortly.',
                style: AppTextStyles.body
                    .copyWith(color: colors.textSecondary, height: 1.5),
                textAlign: TextAlign.center,
              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2, end: 0),
              
              const SizedBox(height: 40),
              if (_bookingId != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: colors.surfaceElevated,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    children: [
                      Text('Keep your booking ID',
                          style: AppTextStyles.caption
                              .copyWith(color: colors.textSecondary)),
                      const SizedBox(height: 4),
                      Text(_bookingId!,
                          style: AppTextStyles.subtitle.copyWith(
                            color: AppColors.error,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                          )),
                    ],
                  ),
                ).animate().fadeIn(delay: 300.ms).scale(begin: const Offset(0.95, 0.95)),
              const SizedBox(height: 40),
              
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).popUntil(
                    (route) => route.settings.name == '/home' || route.isFirst,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.surfaceElevated,
                    foregroundColor: colors.textPrimary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Back to Home',
                      style: TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 16)),
                ),
              ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2, end: 0),
            ],
          ),
        ),
      ),
    );
  }
}
