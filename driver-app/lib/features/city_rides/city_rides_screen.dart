import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../app/theme.dart';
import '../../core/data/socket_service.dart';
import '../../core/utils/maps_launcher_util.dart';
import 'city_ride_model.dart';
import 'city_rides_service.dart';

class CityRidesScreen extends StatefulWidget {
  const CityRidesScreen({super.key});

  @override
  State<CityRidesScreen> createState() => _CityRidesScreenState();
}

class _CityRidesScreenState extends State<CityRidesScreen> {
  final CityRidesService _service = CityRidesService.instance;
  final Set<String> _animatingOutIds = {};
  String _enteredPin = '';
  String? _pinError;
  bool _isVerifyingPin = false;

  /// Subscription to city:request socket events for real-time ride delivery
  StreamSubscription<Map<String, dynamic>>? _cityRideSocketSub;

  @override
  void initState() {
    super.initState();
    // Force a live fetch every time this screen opens (bypasses the _initialized guard)
    _service.forceRefresh();
    // Ensure socket is connected and listen for city:request events in real-time
    SocketService.init().then((_) {
      _cityRideSocketSub = SocketService.onCityRideRequest.listen((booking) {
        if (!mounted) return;
        // forceAccept:true — backend already classified this as a city ride
        _service.ingestSocketRequest(booking, forceAccept: true);
        HapticFeedback.mediumImpact();
      });
    });
  }

  @override
  void dispose() {
    _cityRideSocketSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<CityRideRequest?>(
      valueListenable: _service.activeRide,
      builder: (context, activeRide, child) {
        if (activeRide != null) {
          return _buildActiveRideScaffold(context, activeRide);
        }
        return _buildFeedScaffold(context);
      },
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FEED VIEW (All Ongoing/Incoming User Ride Requests)
  // ─────────────────────────────────────────────────────────────────────────

  Widget _buildFeedScaffold(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final bgColor =
        isDark ? AppColors.backgroundDark : AppColors.backgroundLight;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: surfaceColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'City Rides',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20),
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh requests',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              setState(() {
                _animatingOutIds.clear();
              });
              _service.refreshIncomingRequests();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Refreshed nearby city ride requests'),
                  duration: Duration(seconds: 1),
                ),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Status bar
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: isDark ? 0.15 : 0.08),
                border: Border(
                  bottom: BorderSide(
                    color: AppColors.gold.withValues(alpha: 0.2),
                  ),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: AppColors.success,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.success.withValues(alpha: 0.5),
                          blurRadius: 6,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'Online · Looking for passenger ride requests nearby',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.gold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Requests List
            Expanded(
              child: ValueListenableBuilder<List<CityRideRequest>>(
                valueListenable: _service.incomingRequests,
                builder: (context, requests, child) {
                  final visibleRequests = requests
                      .where((r) => !_animatingOutIds.contains(r.id))
                      .toList();

                  if (visibleRequests.isEmpty) {
                    return _buildEmptyFeedState();
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                    itemCount: requests.length,
                    itemBuilder: (context, index) {
                      final req = requests[index];
                      final isIgnored = _animatingOutIds.contains(req.id);

                      return AnimatedSize(
                        duration: const Duration(milliseconds: 350),
                        curve: Curves.easeInOutCubic,
                        child: AnimatedOpacity(
                          duration: const Duration(milliseconds: 250),
                          opacity: isIgnored ? 0.0 : 1.0,
                          child: isIgnored
                              ? const SizedBox.shrink()
                              : AnimatedSlide(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeOutCubic,
                                  offset: isIgnored
                                      ? const Offset(-1.0, 0)
                                      : Offset.zero,
                                  child: Padding(
                                    padding: const EdgeInsets.only(bottom: 16),
                                    child: _buildRequestCard(req),
                                  ),
                                ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyFeedState() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.surfaceAltDark
                    : AppColors.surfaceAltLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.directions_car_filled_outlined,
                size: 48,
                color: AppColors.gold,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'No active requests nearby',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              'All current passenger requests have been handled. Stay online or tap below to reload requests.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () {
                setState(() => _animatingOutIds.clear());
                _service.refreshIncomingRequests();
              },
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Reload Sample Requests'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestCard(CityRideRequest req) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final borderColor =
        isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight;

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Rider header & fare bar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.surfaceAltDark
                    : AppColors.surfaceAltLight,
                border: Border(
                  bottom: BorderSide(
                    color:
                        isDark ? AppColors.dividerDark : AppColors.dividerLight,
                  ),
                ),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: AppColors.gold.withValues(alpha: 0.15),
                    child: const Icon(Icons.person,
                        color: AppColors.gold, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          req.riderName,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded,
                                color: Colors.amber, size: 16),
                            const SizedBox(width: 3),
                            Text(
                              '${req.riderRating} · ${req.riderRidesCount} rides',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Fare Pill
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '₹${req.estimatedFare.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: AppColors.gold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          req.paymentMethod.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppColors.gold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Route points
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Pickup
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(top: 3),
                        width: 12,
                        height: 12,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'PICKUP · ${req.pickupDistanceKm} km away (${req.pickupEtaMin} min)',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textSecondary,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              req.pickupAddress,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Route link
                  Container(
                    margin: const EdgeInsets.only(left: 5, top: 4, bottom: 4),
                    height: 20,
                    width: 2,
                    color:
                        isDark ? AppColors.dividerDark : AppColors.dividerLight,
                  ),

                  // Destination
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(top: 3),
                        width: 12,
                        height: 12,
                        decoration: const BoxDecoration(
                          color: AppColors.error,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'DROP-OFF · ${req.tripDistanceKm} km (${req.tripDurationMin} min)',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textSecondary,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              req.dropAddress,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Action Buttons: Ignore & Accept
            Container(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Row(
                children: [
                  // Ignore Button
                  Expanded(
                    flex: 1,
                    child: OutlinedButton(
                      onPressed: () => _handleIgnore(req.id),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.textSecondary,
                        side: BorderSide(
                          color: isDark
                              ? AppColors.borderSubtleDark
                              : AppColors.borderSubtleLight,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: const Text(
                        'Ignore',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Accept Button
                  Expanded(
                    flex: 2,
                    child: FilledButton(
                      onPressed: () => _handleAccept(req),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.gold,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle_outline, size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Accept Ride',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleIgnore(String id) {
    HapticFeedback.lightImpact();
    setState(() {
      _animatingOutIds.add(id);
    });
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) {
        _service.ignoreRequest(id);
        setState(() {
          _animatingOutIds.remove(id);
        });
      }
    });
  }

  Future<void> _handleAccept(CityRideRequest req) async {
    HapticFeedback.mediumImpact();
    setState(() {
      _enteredPin = '';
      _pinError = null;
    });
    final accepted = await _service.acceptRequest(req);
    if (!accepted && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.error,
          content: Text(
            'This ride could not be accepted. It may no longer be available.',
          ),
        ),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIVE RIDE FLOW (Accepted, Arrived, In Progress, Completed, Cancelled)
  // ─────────────────────────────────────────────────────────────────────────

  Widget _buildActiveRideScaffold(
      BuildContext context, CityRideRequest activeRide) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final bgColor =
        isDark ? AppColors.backgroundDark : AppColors.backgroundLight;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: surfaceColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          tooltip: 'Exit City Ride View',
          onPressed: () {
            if (activeRide.status == CityRideStatus.completed ||
                activeRide.status == CityRideStatus.cancelled) {
              _service.clearActiveRide();
            } else {
              _showExitConfirmationDialog();
            }
          },
        ),
        title: Text(
          _getActiveTitle(activeRide.status),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        actions: [
          // Simulate Rider Cancel menu button for testing
          if (activeRide.status == CityRideStatus.accepted ||
              activeRide.status == CityRideStatus.arrived)
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert_rounded),
              onSelected: (val) {
                if (val == 'cancel_sim') {
                  _service.simulateRiderCancel();
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'cancel_sim',
                  child: Row(
                    children: [
                      Icon(Icons.cancel_outlined,
                          color: AppColors.error, size: 20),
                      SizedBox(width: 8),
                      Text('Simulate Rider Cancel'),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildActiveStatusBanner(activeRide),
                    const SizedBox(height: 18),

                    // Cancelled State UI
                    if (activeRide.status == CityRideStatus.cancelled)
                      _buildCancelledStateUI(activeRide)
                    // Completed State UI
                    else if (activeRide.status == CityRideStatus.completed)
                      _buildCompletedStateUI(activeRide)
                    // Active Ride Stages
                    else ...[
                      _buildRiderCard(activeRide),
                      const SizedBox(height: 16),
                      _buildRouteCard(activeRide),
                      const SizedBox(height: 16),

                      // Step 1: Heading to Pickup
                      if (activeRide.status == CityRideStatus.accepted)
                        _buildHeadingToPickupSection(activeRide),

                      // Step 2: Arrived & Enter PIN
                      if (activeRide.status == CityRideStatus.arrived)
                        _buildArrivedAndPinSection(activeRide),

                      // Step 3: Ongoing Ride
                      if (activeRide.status == CityRideStatus.inProgress)
                        _buildOngoingRideSection(activeRide),
                    ],
                  ],
                ),
              ),
            ),

            // Bottom Action Bar
            _buildBottomActionBar(activeRide),
          ],
        ),
      ),
    );
  }

  String _getActiveTitle(CityRideStatus status) {
    return switch (status) {
      CityRideStatus.pending => 'Ride Request',
      CityRideStatus.accepted => 'Heading to Pickup',
      CityRideStatus.arrived => 'Arrived at Pickup',
      CityRideStatus.inProgress => 'Trip in Progress',
      CityRideStatus.completed => 'Trip Completed',
      CityRideStatus.cancelled => 'Trip Cancelled',
    };
  }

  Widget _buildActiveStatusBanner(CityRideRequest ride) {
    Color bg;
    Color fg;
    IconData icon;
    String text;

    switch (ride.status) {
      case CityRideStatus.accepted:
        bg = AppColors.gold.withValues(alpha: 0.12);
        fg = AppColors.gold;
        icon = Icons.navigation_rounded;
        text = 'Ride Accepted · Navigate to passenger pickup';
        break;
      case CityRideStatus.arrived:
        bg = Colors.amber.withValues(alpha: 0.15);
        fg = Colors.amber.shade800;
        icon = Icons.pin_drop_rounded;
        text = 'At Pickup · Verify 4-digit PIN to start trip';
        break;
      case CityRideStatus.inProgress:
        bg = AppColors.success.withValues(alpha: 0.12);
        fg = AppColors.success;
        icon = Icons.directions_car_rounded;
        text = 'Ongoing Ride · Navigating to destination';
        break;
      case CityRideStatus.completed:
        bg = AppColors.success.withValues(alpha: 0.12);
        fg = AppColors.success;
        icon = Icons.check_circle_rounded;
        text = 'Trip successfully completed';
        break;
      case CityRideStatus.cancelled:
        bg = AppColors.error.withValues(alpha: 0.12);
        fg = AppColors.error;
        icon = Icons.cancel_rounded;
        text = 'Ride cancelled by passenger';
        break;
      default:
        bg = AppColors.gold.withValues(alpha: 0.1);
        fg = AppColors.gold;
        icon = Icons.info_outline;
        text = 'City Ride Active';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: fg.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: fg, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: fg,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRiderCard(CityRideRequest ride) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color:
              isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: AppColors.gold.withValues(alpha: 0.15),
            child: const Icon(Icons.person, color: AppColors.gold, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  ride.riderName,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    const Icon(Icons.star_rounded,
                        color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '${ride.riderRating} · ${ride.riderRidesCount} city rides',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content:
                        Text('Calling ${ride.riderName} (${ride.riderPhone})')),
              );
            },
            icon: const Icon(Icons.call_rounded, color: AppColors.gold),
            tooltip: 'Call rider',
          ),
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Chat with ${ride.riderName}')),
              );
            },
            icon: const Icon(Icons.chat_bubble_outline_rounded,
                color: AppColors.gold),
            tooltip: 'Message rider',
          ),
        ],
      ),
    );
  }

  Widget _buildRouteCard(CityRideRequest ride) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color:
              isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
        ),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.radio_button_checked,
                  color: AppColors.success, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PICKUP LOCATION',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textSecondary,
                        letterSpacing: 0.6,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      ride.pickupAddress,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(left: 9, top: 4, bottom: 4),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Container(
                width: 2,
                height: 18,
                color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
              ),
            ),
          ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on, color: AppColors.error, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'DESTINATION',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textSecondary,
                        letterSpacing: 0.6,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      ride.dropAddress,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Divider(
              color: isDark ? AppColors.dividerDark : AppColors.dividerLight),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Estimated Fare',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '₹${ride.estimatedFare.toStringAsFixed(0)} (${ride.paymentMethod})',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.gold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Heading to Pickup Section ─────────────────────────────────────────────
  Widget _buildHeadingToPickupSection(CityRideRequest ride) {
    return Column(
      children: [
        // Launch Google Maps navigation to pickup
        SizedBox(
          width: double.infinity,
          height: 52,
          child: OutlinedButton.icon(
            onPressed: () => _openMapsToPickup(ride),
            icon: const Icon(Icons.map_rounded, color: AppColors.gold),
            label: const Text(
              'Navigate to Pickup in Google Maps',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.gold,
              side: const BorderSide(color: AppColors.gold, width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Tap above to launch driving directions to ${ride.pickupAddress}',
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
            fontStyle: FontStyle.italic,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  // ── Arrived & Enter PIN Section ────────────────────────────────────────────
  Widget _buildArrivedAndPinSection(CityRideRequest ride) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.gold.withValues(alpha: 0.4),
          width: 1.5,
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.lock_clock_outlined,
                color: AppColors.gold, size: 30),
          ),
          const SizedBox(height: 12),
          const Text(
            'Enter Rider\'s Ride PIN',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(
            'Ask the passenger for their 4-digit PIN to verify and start the trip.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 8),

          // Demo rides expose a sample PIN. Live ride PINs are only verified
          // by the backend and are never displayed to the driver.
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color:
                  isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              ride.isDemo
                  ? 'Passenger PIN: ${ride.ridePin}'
                  : 'Enter the PIN shown by the passenger',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.gold,
                letterSpacing: 2,
              ),
            ),
          ),
          const SizedBox(height: 20),

          // 4-Digit Boxes
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(4, (index) {
              final digit =
                  index < _enteredPin.length ? _enteredPin[index] : '';
              final isFocused = index == _enteredPin.length;

              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 6),
                width: 50,
                height: 56,
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.inputFillDark
                      : AppColors.inputFillLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isFocused
                        ? AppColors.gold
                        : (_pinError != null
                            ? AppColors.error
                            : (digit.isNotEmpty
                                ? AppColors.gold.withValues(alpha: 0.5)
                                : (isDark
                                    ? AppColors.dividerDark
                                    : AppColors.dividerLight))),
                    width: isFocused ? 2 : 1.2,
                  ),
                ),
                child: Center(
                  child: Text(
                    digit,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              );
            }),
          ),

          if (_pinError != null) ...[
            const SizedBox(height: 12),
            Text(
              _pinError!,
              style: const TextStyle(
                color: AppColors.error,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ],

          const SizedBox(height: 20),

          // Custom Keypad
          _buildNumericKeypad(ride),
        ],
      ),
    );
  }

  Widget _buildNumericKeypad(CityRideRequest ride) {
    return Column(
      children: [
        for (var row in [
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['clear', '0', 'back'],
        ])
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: row.map((key) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  width: 68,
                  height: 48,
                  child: TextButton(
                    onPressed: () => _handleKeypadPress(key, ride),
                    style: TextButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: key == 'back'
                        ? const Icon(Icons.backspace_outlined, size: 20)
                        : (key == 'clear'
                            ? const Text('CLR',
                                style: TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 12))
                            : Text(
                                key,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                ),
                              )),
                  ),
                );
              }).toList(),
            ),
          ),
      ],
    );
  }

  void _handleKeypadPress(String key, CityRideRequest ride) {
    HapticFeedback.lightImpact();
    setState(() {
      _pinError = null;
      if (key == 'back') {
        if (_enteredPin.isNotEmpty) {
          _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
        }
      } else if (key == 'clear') {
        _enteredPin = '';
      } else {
        if (_enteredPin.length < 4) {
          _enteredPin += key;
          if (_enteredPin.length == 4) {
            _verifyAndStartTrip(ride);
          }
        }
      }
    });
  }

  Future<void> _verifyAndStartTrip(CityRideRequest ride) async {
    setState(() => _isVerifyingPin = true);
    await Future.delayed(const Duration(milliseconds: 400));

    final success = await _service.verifyPinAndStartRide(_enteredPin);
    if (!mounted) return;

    setState(() => _isVerifyingPin = false);

    if (success) {
      HapticFeedback.heavyImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.success,
          content: Text('PIN Verified! Starting trip to destination.'),
        ),
      );

      // Launch Google Maps navigation from pickup to destination!
      _openMapsToDestination(ride);
    } else {
      HapticFeedback.vibrate();
      setState(() {
        _pinError = 'Incorrect PIN. Ask passenger or check sample PIN.';
      });
    }
  }

  // ── Ongoing Ride Section ──────────────────────────────────────────────────
  Widget _buildOngoingRideSection(CityRideRequest ride) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Column(
      children: [
        // Live Navigation Button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton.icon(
            onPressed: () => _openMapsToDestination(ride),
            icon: const Icon(Icons.navigation_rounded),
            label: const Text(
              'Open Google Maps Navigation',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
            ),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.gold,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
        const SizedBox(height: 18),

        // Live Trip Stats
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isDark
                  ? AppColors.borderSubtleDark
                  : AppColors.borderSubtleLight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Trip in Progress',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                  Text(
                    'En Route',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: const LinearProgressIndicator(
                  value: 0.65,
                  minHeight: 8,
                  backgroundColor: Colors.black12,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.gold),
                ),
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Destination: ${ride.dropAddress}',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Completed State UI ───────────────────────────────────────────────────
  Widget _buildCompletedStateUI(CityRideRequest ride) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.success.withValues(alpha: 0.4),
          width: 1.5,
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_rounded,
                color: AppColors.success, size: 48),
          ),
          const SizedBox(height: 16),
          const Text(
            'City Ride Completed!',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            'The fare has been credited to your driver balance.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          // Fare Summary Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color:
                  isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                Text(
                  '₹${ride.estimatedFare.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                    color: AppColors.gold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  ride.paymentMethod == 'Cash'
                      ? 'COLLECT CASH FROM RIDER'
                      : 'PAID ONLINE / UPI',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: ride.paymentMethod == 'Cash'
                        ? Colors.amber.shade800
                        : AppColors.success,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 12),
                Divider(
                    color: isDark
                        ? AppColors.dividerDark
                        : AppColors.dividerLight),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Passenger',
                        style: TextStyle(color: AppColors.textSecondary)),
                    Text(ride.riderName,
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Distance',
                        style: TextStyle(color: AppColors.textSecondary)),
                    Text('${ride.tripDistanceKm} km',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Duration',
                        style: TextStyle(color: AppColors.textSecondary)),
                    Text('${ride.tripDurationMin} mins',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Cancelled State UI ───────────────────────────────────────────────────
  Widget _buildCancelledStateUI(CityRideRequest ride) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.error.withValues(alpha: 0.4),
          width: 1.5,
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.error.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.cancel_rounded,
                color: AppColors.error, size: 48),
          ),
          const SizedBox(height: 16),
          const Text(
            'Ride Cancelled by Rider',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            ride.cancellationReason ??
                'The passenger decided to cancel the ride while you were en route.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 20),

          // Cancellation Fee Credited Badge
          if (ride.cancellationFee != null && ride.cancellationFee! > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: AppColors.success.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.account_balance_wallet_rounded,
                      color: AppColors.success, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    '₹${ride.cancellationFee!.toStringAsFixed(0)} Cancellation Fee Credited',
                    style: const TextStyle(
                      color: AppColors.success,
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // ── Bottom Action Bar ────────────────────────────────────────────────────
  Widget _buildBottomActionBar(CityRideRequest ride) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
      decoration: BoxDecoration(
        color: surfaceColor,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: _getBottomButton(ride),
        ),
      ),
    );
  }

  Widget _getBottomButton(CityRideRequest ride) {
    switch (ride.status) {
      case CityRideStatus.accepted:
        return FilledButton(
          onPressed: () {
            HapticFeedback.mediumImpact();
            _service.markArrivedAtPickup();
          },
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.gold,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          child: const Text(
            'I Have Arrived',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
        );

      case CityRideStatus.arrived:
        return FilledButton(
          onPressed: _isVerifyingPin
              ? null
              : () {
                  if (_enteredPin.length == 4) {
                    _verifyAndStartTrip(ride);
                  } else {
                    setState(() {
                      _pinError = 'Please enter all 4 digits of the PIN';
                    });
                  }
                },
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.gold,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          child: _isVerifyingPin
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: Colors.white,
                  ),
                )
              : const Text(
                  'Verify PIN & Start Ride',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                ),
        );

      case CityRideStatus.inProgress:
        return FilledButton(
          onPressed: () async {
            HapticFeedback.heavyImpact();
            final completed = await _service.completeCurrentRide();
            if (completed == null && mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  backgroundColor: AppColors.error,
                  content: Text(
                    'Could not complete this ride. Check your connection and try again.',
                  ),
                ),
              );
            }
          },
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.success,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.check_circle_rounded, size: 20),
              SizedBox(width: 8),
              Text(
                'Complete Ride',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
              ),
            ],
          ),
        );

      case CityRideStatus.completed:
      case CityRideStatus.cancelled:
        return FilledButton(
          onPressed: () {
            _service.clearActiveRide();
          },
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.gold,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          child: const Text(
            'Return to Available Requests',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
        );

      default:
        return const SizedBox.shrink();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NAVIGATION HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  void _openMapsToPickup(CityRideRequest ride) {
    HapticFeedback.lightImpact();
    MapsLauncherUtil.launchNavigation(
      destLat: ride.pickupLat,
      destLng: ride.pickupLng,
      destinationLabel: ride.pickupAddress,
    );
  }

  void _openMapsToDestination(CityRideRequest ride) {
    HapticFeedback.lightImpact();
    MapsLauncherUtil.launchNavigation(
      originLat: ride.pickupLat,
      originLng: ride.pickupLng,
      destLat: ride.dropLat,
      destLng: ride.dropLng,
      destinationLabel: ride.dropAddress,
    );
  }

  void _showExitConfirmationDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Leave Active Ride?'),
        content: const Text(
          'You have an active city ride in progress. You can return to it anytime from the City Rides menu.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Stay'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Exit View'),
          ),
        ],
      ),
    );
  }
}
