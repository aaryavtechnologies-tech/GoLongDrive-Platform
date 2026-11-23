// lib/screens/home/home_screen.dart
import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_history_item.dart';
import '../../widgets/primary_button.dart';
import '../../routes/app_routes.dart';
import '../booking/location_search_sheet.dart';
import '../tour_packages/tour_package_entry.dart';
import '../tour_packages/tour_packages_screen.dart';
import '../booking/journey_date_time_sheet.dart';
import '../../core/services/user_scope.dart';
import '../../core/services/booking_service.dart';
import '../../core/services/socket_service.dart';
import '../../core/data/api_client.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  // State for the search card
  String _fromLocation = '';
  String _toLocation = '';
  LatLng? _fromLatLng;
  LatLng? _toLatLng;

  DateTime? _journeyDate;
  TimeOfDay? _pickupTime;

  int _passengers = 2;
  int _luggage = 2;

  List<RideHistoryItem> _recentBookings = [];
  Map<String, dynamic>? _previewDistanceData;
  bool _isLoadingPreviewDistance = false;
  Map<String, dynamic>? _activeBooking;

  StreamSubscription? _rideCancelledSub;
  StreamSubscription? _localCancelledSub;
  StreamSubscription? _statusUpdateSub;

  late final AnimationController _swapController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 300),
  );

  @override
  void initState() {
    super.initState();

    // Listen to real-time cancellation events from socket
    _rideCancelledSub = UserSocketService.onRideCancelled.listen((data) {
      if (!mounted) return;
      final cId = data['bookingId']?.toString() ?? data['tripId']?.toString();
      if (cId != null && cId.isNotEmpty) {
        BookingService.markBookingCancelled(cId);
      }
      setState(() => _activeBooking = null);
      _fetchRecentBookings();
    });

    // Listen to local cancellation events from booking service
    _localCancelledSub = BookingService.onLocalBookingCancelled.listen((cancelledId) {
      if (!mounted) return;
      setState(() => _activeBooking = null);
      _fetchRecentBookings();
    });

    // Listen to status update events
    _statusUpdateSub = UserSocketService.onStatusUpdate.listen((data) {
      if (!mounted) return;
      final status = (data['status'] ?? data['rideStatus'] ?? '').toString().toLowerCase();
      if (status.contains('cancel') || status.contains('complete')) {
        setState(() => _activeBooking = null);
      }
      _fetchRecentBookings();
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        UserScope.of(context, listen: false).fetchProfile();
        _fetchRecentBookings();
      }
    });
  }

  Future<void> _fetchRecentBookings() async {
    try {
      final bookings = await BookingService.getMyBookings();
      final List<RideHistoryItem> items = [];
      Map<String, dynamic>? activeRide;

      const activeStatuses = [
        'pending',
        'searching driver',
        'driver accepted',
        'driver assigned',
        'driver arriving',
        'driver arrived',
        'trip started',
        'in progress',
        'awaiting payment',
        'awaitingpayment',
      ];

      for (final b in bookings) {
        final bId = (b['_id'] ?? b['id'] ?? b['bookingId'] ?? '').toString();
        final statusStr =
            (b['rideStatus']?.toString() ?? b['status']?.toString() ?? '')
                .toLowerCase()
                .trim();

        final isLocallyCancelled = BookingService.isBookingCancelled(bId);

        if (!isLocallyCancelled &&
            !statusStr.contains('cancel') &&
            !statusStr.contains('complete') &&
            activeStatuses.contains(statusStr)) {
          // If it's a stale pending/searching ride older than 4 hours, ignore it
          bool isStale = false;
          if (statusStr == 'pending' || statusStr == 'searching driver') {
            final dateStr = b['createdAt']?.toString() ?? b['pickupDate']?.toString();
            if (dateStr != null && dateStr.isNotEmpty) {
              final parsed = DateTime.tryParse(dateStr);
              if (parsed != null && DateTime.now().difference(parsed).inHours >= 4) {
                isStale = true;
              }
            }
          }
          if (!isStale) {
            activeRide ??= b;
            continue;
          }
        }

        if (items.length >= 5) continue;

        final from = b['pickupAddress'] ?? b['pickupLocation']?['address'] ?? b['from'] ?? 'Unknown';
        final to = b['dropAddress'] ?? b['dropLocation']?['address'] ?? b['to'] ?? 'Unknown';
        final fare = b['fareAmount'] != null
            ? '₹${b['fareAmount']}'
            : (b['total']?.toString() ?? '');
        final date = b['pickupDate'] ?? b['date'] ?? '';
        final status = (isLocallyCancelled || statusStr.contains('cancel'))
            ? RideStatus.cancelled
            : RideStatus.completed;

        items.add(RideHistoryItem(
          id: bId,
          fromAddress: from,
          toAddress: to,
          dateLabel: date,
          fare: fare,
          status: status,
          vehicleLabel: b['vehicleType'] ?? 'Car',
          carName: b['vehicleType'] ?? 'Car',
        ));
      }
      if (mounted) {
        setState(() {
          _recentBookings = items;
          _activeBooking = activeRide;
        });
      }
    } catch (_) {}
  }

  double _calculateHaversine(LatLng p1, LatLng p2) {
    const p = 0.017453292519943295; // Math.PI / 180
    final a = 0.5 -
        math.cos((p2.latitude - p1.latitude) * p) / 2 +
        math.cos(p1.latitude * p) *
            math.cos(p2.latitude * p) *
            (1 - math.cos((p2.longitude - p1.longitude) * p)) /
            2;
    return 12742 * math.asin(math.sqrt(a)); // 2 * R (R = 6371 km)
  }

  Future<void> _fetchRoutePreview(StateSetter? setSheetState) async {
    if (_fromLatLng == null || _toLatLng == null) return;
    if (setSheetState != null) {
      setSheetState(() => _isLoadingPreviewDistance = true);
    }
    setState(() => _isLoadingPreviewDistance = true);

    try {
      final data = await BookingService.getRouteDistance(
        originLat: _fromLatLng!.latitude,
        originLng: _fromLatLng!.longitude,
        destLat: _toLatLng!.latitude,
        destLng: _toLatLng!.longitude,
      );
      if (data != null && mounted) {
        if (setSheetState != null) {
          setSheetState(() {
            _previewDistanceData = data;
            _isLoadingPreviewDistance = false;
          });
        }
        setState(() {
          _previewDistanceData = data;
          _isLoadingPreviewDistance = false;
        });
      } else {
        if (setSheetState != null) {
          setSheetState(() => _isLoadingPreviewDistance = false);
        }
        setState(() => _isLoadingPreviewDistance = false);
      }
    } catch (_) {
      if (setSheetState != null) {
        setSheetState(() => _isLoadingPreviewDistance = false);
      }
      setState(() => _isLoadingPreviewDistance = false);
    }
  }

  @override
  void dispose() {
    _rideCancelledSub?.cancel();
    _localCancelledSub?.cancel();
    _statusUpdateSub?.cancel();
    _swapController.dispose();
    super.dispose();
  }

  void _swapLocations(StateSetter? setSheetState) {
    if (_fromLocation.isEmpty && _toLocation.isEmpty) return;

    _swapController.forward(from: 0.0);

    final newFromLoc = _toLocation;
    final newFromLat = _toLatLng;
    final newToLoc = _fromLocation;
    final newToLat = _fromLatLng;

    setState(() {
      _fromLocation = newFromLoc;
      _fromLatLng = newFromLat;
      _toLocation = newToLoc;
      _toLatLng = newToLat;
    });
    if (setSheetState != null) {
      setSheetState(() {});
    }
    if (_fromLatLng != null && _toLatLng != null) {
      _fetchRoutePreview(setSheetState);
    }
  }

  void _openProfile() {
    Navigator.of(context).pushNamed(AppRoutes.profile);
  }

  void _openMyRides() {
    Navigator.of(context).pushNamed(AppRoutes.myRides);
  }

  void _searchCars() {
    if (_fromLatLng == null || _toLatLng == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Please select both Pickup and Drop locations.')),
      );
      return;
    }
    if (_journeyDate == null || _pickupTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Please select your Journey Date & Time.')),
      );
      return;
    }
    Navigator.of(context).pop(); // Close bottom sheet
    Navigator.of(context).pushNamed(
      '/search-results',
      arguments: {
        'from': _fromLocation,
        'to': _toLocation,
        'fromLatLng': _fromLatLng,
        'toLatLng': _toLatLng,
        'date': _journeyDate,
        'time': _pickupTime,
        'passengers': _passengers,
        'luggage': _luggage,
      },
    );
  }

  Future<void> _pickLocation(bool isFrom, StateSetter setSheetState) async {
    final result = await showLocationSearchSheet(
      context,
      initialQuery: isFrom ? _fromLocation : _toLocation,
      hintText: isFrom ? 'Where from?' : 'Where to?',
    );

    if (result != null) {
      setState(() {
        if (isFrom) {
          _fromLocation = result.address;
          _fromLatLng = result.latLng;
        } else {
          _toLocation = result.address;
          _toLatLng = result.latLng;
        }
      });
      setSheetState(() {});
      if (_fromLatLng != null && _toLatLng != null) {
        _fetchRoutePreview(setSheetState);
      }
    }
  }

  Future<void> _pickDateTime(StateSetter setSheetState) async {
    final result = await showJourneyDateTimeSheet(
      context,
      initialDate: _journeyDate,
      initialTime: _pickupTime,
    );

    if (result != null) {
      setState(() {
        _journeyDate = result.date;
        _pickupTime = result.time;
      });
      setSheetState(() {});
    }
  }

  void _showSearchBottomSheet(BuildContext context) {
    final colors = AppColors.of(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      useSafeArea: true,
      builder: (BuildContext context) {
        return StatefulBuilder(
            builder: (BuildContext context, StateSetter setSheetState) {
          final bool hasBothLocations =
              _fromLatLng != null && _toLatLng != null;

          return Container(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            decoration: BoxDecoration(
              color: colors.background,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle bar
                    Center(
                      child: Container(
                        width: 40,
                        height: 5,
                        decoration: BoxDecoration(
                          color: colors.divider,
                          borderRadius: BorderRadius.circular(2.5),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text('Plan your journey',
                        style: AppTextStyles.mediumHeading
                            .copyWith(color: colors.textPrimary)),
                    const SizedBox(height: 24),

                    // Location Fields Container
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: colors.inputBorder),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Column(
                            children: [
                              const Icon(Icons.circle,
                                  size: 12, color: AppColors.primaryGold),
                              Container(
                                  width: 2, height: 40, color: colors.divider),
                              Icon(Icons.location_on,
                                  size: 16, color: colors.accentIcon),
                            ],
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              children: [
                                // FROM FIELD
                                GestureDetector(
                                  onTap: () =>
                                      _pickLocation(true, setSheetState),
                                  child: Container(
                                    color:
                                        Colors.transparent, // expand tap area
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 8),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            _fromLocation.isEmpty
                                                ? 'Where from?'
                                                : _fromLocation,
                                            style: _fromLocation.isEmpty
                                                ? AppTextStyles.body.copyWith(
                                                    color: colors.textSecondary)
                                                : AppTextStyles.body.copyWith(
                                                    color: colors.textPrimary,
                                                    fontWeight:
                                                        FontWeight.w600),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                Divider(height: 16, color: colors.divider),
                                // TO FIELD
                                GestureDetector(
                                  onTap: () =>
                                      _pickLocation(false, setSheetState),
                                  child: Container(
                                    color: Colors.transparent,
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 8),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            _toLocation.isEmpty
                                                ? 'Where to?'
                                                : _toLocation,
                                            style: _toLocation.isEmpty
                                                ? AppTextStyles.body.copyWith(
                                                    color: colors.textSecondary)
                                                : AppTextStyles.body.copyWith(
                                                    color: colors.textPrimary,
                                                    fontWeight:
                                                        FontWeight.w600),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          // SWAP BUTTON
                          GestureDetector(
                            onTap: () => _swapLocations(setSheetState),
                            child: AnimatedBuilder(
                              animation: _swapController,
                              builder: (context, child) {
                                return Transform.rotate(
                                  angle: _swapController.value * math.pi,
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: colors.background,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: colors.divider),
                                    ),
                                    child: Icon(Icons.swap_vert,
                                        color: colors.textSecondary, size: 20),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),

                    if (hasBothLocations) ...[
                      const SizedBox(height: 24),
                      _buildMapPreview(colors),
                    ],

                    const SizedBox(height: 24),
                    // Journey Date & Time Button
                    GestureDetector(
                      onTap: () => _pickDateTime(setSheetState),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: colors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: colors.inputBorder),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.calendar_month,
                                    color: colors.accentIcon, size: 20),
                                const SizedBox(width: 12),
                                Text(
                                  _journeyDate == null
                                      ? 'Select Date & Time'
                                      : '${_journeyDate!.day} ${_getMonthName(_journeyDate!.month)} ${_journeyDate!.year} • ${_pickupTime!.format(context)}',
                                  style: _journeyDate == null
                                      ? AppTextStyles.body
                                          .copyWith(color: colors.textSecondary)
                                      : AppTextStyles.body.copyWith(
                                          color: colors.textPrimary,
                                          fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            Icon(Icons.chevron_right,
                                color: colors.textSecondary, size: 20),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),
                    // Trip Details: Passengers & Luggage
                    Row(
                      children: [
                        Expanded(
                          child: _buildCounter(
                            colors,
                            'Passengers',
                            _passengers,
                            (val) {
                              if (val > 0) {
                                setSheetState(() => _passengers = val);
                                setState(() => _passengers = val);
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildCounter(
                            colors,
                            'Luggage',
                            _luggage,
                            (val) {
                              if (val >= 0) {
                                setSheetState(() => _luggage = val);
                                setState(() => _luggage = val);
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    PrimaryButton(
                      label: 'Search Cars',
                      onPressed: hasBothLocations ? _searchCars : null,
                    ),
                  ],
                ),
              ),
            ),
          );
        });
      },
    );
  }

  Widget _buildMapPreview(AppColorPalette colors) {
    String distanceText = '~ -- KM';
    String durationText = 'Calculating route...';

    if (_previewDistanceData != null) {
      final km = _previewDistanceData!['distanceValueKm'] ??
          _previewDistanceData!['distance'];
      final distStr = _previewDistanceData!['distanceText'] ??
          (km != null ? '$km KM' : null);
      final durStr = _previewDistanceData!['durationText'];
      if (distStr != null) distanceText = '~$distStr';
      if (durStr != null) durationText = 'Estimated travel time: $durStr';
    } else if (_fromLatLng != null && _toLatLng != null) {
      final directKm = _calculateHaversine(_fromLatLng!, _toLatLng!);
      final estimatedRoadKm = (directKm * 1.25).round();
      final estimatedHours = (estimatedRoadKm / 60).floor();
      final estimatedMins = (estimatedRoadKm % 60);
      distanceText = '~$estimatedRoadKm KM';
      durationText = estimatedHours > 0
          ? 'Estimated travel time: $estimatedHours hr $estimatedMins min'
          : 'Estimated travel time: $estimatedMins min';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            height: 60,
            width: 60,
            decoration: BoxDecoration(
              color: AppColors.primaryGold.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.map_outlined,
                color: AppColors.primaryGold, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Route Preview',
                        style: AppTextStyles.body.copyWith(
                            color: colors.textPrimary,
                            fontWeight: FontWeight.w600)),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: colors.background,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _isLoadingPreviewDistance
                            ? 'Calculating...'
                            : distanceText,
                        style: AppTextStyles.caption.copyWith(
                            color: AppColors.primaryGold,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  _isLoadingPreviewDistance
                      ? 'Fetching optimal route...'
                      : durationText,
                  style: AppTextStyles.caption
                      .copyWith(color: colors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildCounter(AppColorPalette colors, String label, int value,
      Function(int) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: colors.inputBorder),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: () => onChanged(value - 1),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                      shape: BoxShape.circle, color: colors.background),
                  child:
                      Icon(Icons.remove, size: 16, color: colors.textPrimary),
                ),
              ),
              Text('$value',
                  style: AppTextStyles.body.copyWith(
                      fontWeight: FontWeight.w600, color: colors.textPrimary)),
              GestureDetector(
                onTap: () => onChanged(value + 1),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                      shape: BoxShape.circle, color: colors.background),
                  child: Icon(Icons.add, size: 16, color: colors.textPrimary),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchRecentBookings,
          color: AppColors.primaryGold,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 110),
            children: [
              _buildHeader(colors),
              const SizedBox(height: 20),
              _buildQuickCategories(colors),
              if (_activeBooking != null) ...[
                const SizedBox(height: 24),
                _buildActiveBookingBanner(colors),
              ],
              const SizedBox(height: 28),
              _buildSearchCard(colors),
              const SizedBox(height: 28),
              const TourPackageEntry(),
              const SizedBox(height: 36),
              _buildRecentRidesSection(colors),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActiveBookingBanner(AppColorPalette colors) {
    final status = (_activeBooking?['rideStatus']?.toString() ??
            _activeBooking?['status']?.toString() ??
            '')
        .toLowerCase()
        .trim();

    final bool isSearching =
        status.isEmpty || status == 'pending' || status == 'searching driver';

    String title = 'Ride Request Sent';
    String subtitle = 'Waiting for nearby drivers to accept...';
    IconData icon = Icons.car_rental;

    if (status.contains('awaiting')) {
      title = 'Ride Completed · Payment Due';
      subtitle = 'Tap to pay online via Razorpay';
      icon = Icons.payment_rounded;
    } else if (status.contains('started') || status.contains('progress')) {
      title = 'Trip In Progress';
      subtitle = 'Tap to view live navigation & ETA';
      icon = Icons.navigation_rounded;
    } else if (status.contains('arrived')) {
      title = 'Driver Arrived at Pickup';
      subtitle = 'Share your ride PIN with driver';
      icon = Icons.pin_drop_rounded;
    } else if (status.contains('accepted') || status.contains('assigned') || status.contains('arriving')) {
      title = 'Driver En Route';
      subtitle = 'Driver assigned! Tap to view live tracking';
      icon = Icons.directions_car_rounded;
    }

    return GestureDetector(
      onTap: () {
        final bId = _activeBooking!['bookingId'] ?? _activeBooking!['_id'];
        if (isSearching) {
          Navigator.of(context).pushNamed('/driver-assigned', arguments: {
            'bookingId': bId,
            'booking': _activeBooking,
          }).then((_) => _fetchRecentBookings());
        } else {
          Navigator.of(context).pushNamed('/active-ride', arguments: bId)
              .then((_) => _fetchRecentBookings());
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: AppColors.primaryYellow,
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryYellow.withValues(alpha: 0.18),
              blurRadius: 18,
              offset: const Offset(0, 4),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryYellow,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryYellow.withValues(alpha: 0.35),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(icon, color: AppColors.textPrimary, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'LIVE RIDE ACTIVE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.0,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    title,
                    style: AppTextStyles.subtitle.copyWith(
                      color: colors.textPrimary,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                  ),
                ],
              ),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                GestureDetector(
                  onTap: () => _confirmCancelActiveRide(),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.close_rounded, size: 14, color: AppColors.error),
                        SizedBox(width: 4),
                        Text(
                          'Cancel',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.error,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: AppColors.inputBackground,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_forward_ios_rounded,
                      size: 14, color: AppColors.textPrimary),
                ),
              ],
            ),
          ],
        ),
      ).animate().fadeIn(duration: 400.ms).slideX(begin: -0.05, end: 0),
    );
  }

  Future<void> _confirmCancelActiveRide() async {
    if (_activeBooking == null) return;
    final bId = (_activeBooking!['bookingId'] ?? _activeBooking!['_id'] ?? '').toString();
    if (bId.isEmpty) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Active Ride?'),
        content: const Text('Are you sure you want to cancel this active booking request?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Keep Ride'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      BookingService.markBookingCancelled(bId);
      setState(() => _activeBooking = null);
      try {
        await BookingService.cancelBooking(bId, reason: 'Cancelled by customer from Home');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Ride cancelled successfully.')),
          );
        }
      } catch (_) {}
      _fetchRecentBookings();
    }
  }

  Widget _buildHeader(AppColorPalette colors) {
    final userController = UserScope.of(context);
    final userProfile = userController.userProfile;
    final fullName = (userProfile?['fullName'] as String?)?.trim();
    final displayName = (fullName != null && fullName.isNotEmpty)
        ? fullName
        : ((userProfile?['email'] as String?)?.split('@').first ?? 'Rider');
    final firstName = displayName.split(' ').first;
    final profileImage = userProfile?['profileImage'] as String?;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Current Service Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryYellow.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppColors.primaryYellow.withValues(alpha: 0.35),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.near_me_rounded,
                        size: 12, color: AppColors.textPrimary),
                    const SizedBox(width: 5),
                    Text(
                      'Outstation & City Cabs',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: colors.textPrimary,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Hello, $firstName 👋',
                style: AppTextStyles.bodySecondary.copyWith(
                  color: colors.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Where to next?',
                style: AppTextStyles.largeHeading.copyWith(
                  color: colors.textPrimary,
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.6,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: _openProfile,
          child: Container(
            height: 50,
            width: 50,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.primaryYellow,
                width: 2.0,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryYellow.withValues(alpha: 0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: ClipOval(
              child: (profileImage != null && profileImage.isNotEmpty)
                  ? Image.network(
                      profileImage.startsWith('http')
                          ? profileImage
                          : '${ApiClient.baseUrl.replaceAll('/api/v1', '')}/$profileImage',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          Icon(Icons.person, color: colors.textPrimary),
                    )
                  : Container(
                      color: AppColors.inputBackground,
                      alignment: Alignment.center,
                      child: Text(
                        firstName.isNotEmpty ? firstName[0].toUpperCase() : 'U',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildQuickCategories(AppColorPalette colors) {
    return Row(
      children: [
        // Outstation (Active)
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
            decoration: BoxDecoration(
              color: AppColors.primaryYellow,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryYellow.withValues(alpha: 0.35),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.directions_car_rounded,
                    size: 18, color: AppColors.textPrimary),
                SizedBox(width: 6),
                Text(
                  'Outstation',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 10),
        // Tour Packages
        Expanded(
          child: GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => TourPackagesScreen()),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
              decoration: BoxDecoration(
                color: AppColors.inputBackground,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFEEEEEE)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.landscape_rounded,
                      size: 18, color: colors.textSecondary),
                  const SizedBox(width: 6),
                  Text(
                    'Tours',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: colors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        // My Bookings
        Expanded(
          child: GestureDetector(
            onTap: _openMyRides,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
              decoration: BoxDecoration(
                color: AppColors.inputBackground,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFEEEEEE)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long_rounded,
                      size: 18, color: colors.textSecondary),
                  const SizedBox(width: 6),
                  Text(
                    'My Rides',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: colors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 50.ms, duration: 350.ms);
  }

  Widget _buildSearchCard(AppColorPalette colors) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFEEEEEE),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: AppColors.primaryYellow.withValues(alpha: 0.10),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primaryYellow.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.route_rounded,
                    color: AppColors.textPrimary, size: 16),
              ),
              const SizedBox(width: 8),
              Text(
                'Plan Your Journey',
                style: AppTextStyles.subtitle.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                  color: colors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // FROM Tile
          GestureDetector(
            onTap: () => _showSearchBottomSheet(context),
            behavior: HitTestBehavior.opaque,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.inputBackground,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFEEEEEE)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ),
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
                            letterSpacing: 0.8,
                            color: colors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          _fromLocation.isEmpty
                              ? 'Enter pickup point (airport, city...)'
                              : _fromLocation,
                          style: _fromLocation.isEmpty
                              ? AppTextStyles.body.copyWith(
                                  color: colors.textSecondary,
                                  fontSize: 13,
                                )
                              : AppTextStyles.body.copyWith(
                                  color: colors.textPrimary,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.search_rounded,
                      size: 18, color: colors.textSecondary),
                ],
              ),
            ),
          ),

          // Swap and Connector
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                Container(
                  width: 2,
                  height: 20,
                  margin: const EdgeInsets.only(left: 10),
                  color: const Color(0xFFDDDDDD),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () => _swapLocations(null),
                  child: AnimatedBuilder(
                    animation: _swapController,
                    builder: (context, child) {
                      return Transform.rotate(
                        angle: _swapController.value * math.pi,
                        child: Container(
                          padding: const EdgeInsets.all(7),
                          decoration: BoxDecoration(
                            color: AppColors.primaryYellow,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryYellow
                                    .withValues(alpha: 0.4),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.swap_vert_rounded,
                              color: AppColors.textPrimary, size: 18),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 8),
              ],
            ),
          ),

          // TO Tile
          GestureDetector(
            onTap: () => _showSearchBottomSheet(context),
            behavior: HitTestBehavior.opaque,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.inputBackground,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFEEEEEE)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      color: AppColors.primaryYellow.withValues(alpha: 0.25),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Icon(Icons.location_on_rounded,
                          size: 15, color: AppColors.textPrimary),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DROP DESTINATION',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                            color: colors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          _toLocation.isEmpty
                              ? 'Where to? (Destination city, hotel...)'
                              : _toLocation,
                          style: _toLocation.isEmpty
                              ? AppTextStyles.body.copyWith(
                                  color: colors.textSecondary,
                                  fontSize: 13,
                                )
                              : AppTextStyles.body.copyWith(
                                  color: colors.textPrimary,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.search_rounded,
                      size: 18, color: colors.textSecondary),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Date, Time, Passengers Chips Row
          Row(
            children: [
              // Date Chip
              Expanded(
                child: GestureDetector(
                  onTap: () => _showSearchBottomSheet(context),
                  behavior: HitTestBehavior.opaque,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.inputBackground,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEEEEEE)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.calendar_today_rounded,
                          size: 15,
                          color: _journeyDate != null
                              ? AppColors.textPrimary
                              : colors.textSecondary,
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            _journeyDate == null
                                ? 'Date'
                                : '${_journeyDate!.day} ${_getMonthName(_journeyDate!.month)}',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: _journeyDate != null
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                              color: _journeyDate != null
                                  ? colors.textPrimary
                                  : colors.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Time Chip
              Expanded(
                child: GestureDetector(
                  onTap: () => _showSearchBottomSheet(context),
                  behavior: HitTestBehavior.opaque,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.inputBackground,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEEEEEE)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.schedule_rounded,
                          size: 15,
                          color: _pickupTime != null
                              ? AppColors.textPrimary
                              : colors.textSecondary,
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            _pickupTime == null
                                ? 'Time'
                                : _pickupTime!.format(context),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: _pickupTime != null
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                              color: _pickupTime != null
                                  ? colors.textPrimary
                                  : colors.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Passengers Chip
              Expanded(
                child: GestureDetector(
                  onTap: () => _showSearchBottomSheet(context),
                  behavior: HitTestBehavior.opaque,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.inputBackground,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEEEEEE)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.group_outlined,
                          size: 15,
                          color: colors.textSecondary,
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            '$_passengers Riders',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: colors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 22),

          // Primary CTA
          PrimaryButton(
            label: 'Search Outstation Cabs',
            onPressed: () {
              if (_fromLatLng == null || _toLatLng == null) {
                _showSearchBottomSheet(context);
              } else {
                _searchCars();
              }
            },
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(delay: 100.ms, duration: 400.ms)
        .slideY(begin: 0.05, end: 0, duration: 400.ms);
  }

  Widget _buildRecentRidesSection(AppColorPalette colors) {
    final ridesToShow = _recentBookings.isNotEmpty
        ? _recentBookings
        : const [
            RideHistoryItem(
              id: 'sample_1',
              fromAddress: 'Ahmedabad',
              toAddress: 'Surat',
              dateLabel: 'Popular Route',
              fare: '₹2,500',
              status: RideStatus.completed,
              vehicleLabel: 'Sedan',
            ),
            RideHistoryItem(
              id: 'sample_2',
              fromAddress: 'Mumbai',
              toAddress: 'Pune',
              dateLabel: 'Popular Route',
              fare: '₹1,800',
              status: RideStatus.completed,
              vehicleLabel: 'Sedan',
            ),
          ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _recentBookings.isNotEmpty ? 'Recent Bookings' : 'Popular Routes',
              style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary),
            ),
            GestureDetector(
              onTap: _openMyRides,
              child: Text('View all', style: AppTextStyles.link),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...ridesToShow.map(
          (ride) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _RecentRideTile(
              ride: ride,
              onTap: () {
                setState(() {
                  _fromLocation = ride.fromAddress;
                  _toLocation = ride.toAddress;
                  _fromLatLng = const LatLng(23.0225, 72.5714);
                  _toLatLng = const LatLng(19.0760, 72.8777);
                });
                _showSearchBottomSheet(context);
              },
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  String _getMonthName(int month) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return months[month - 1];
  }
}

class _RecentRideTile extends StatelessWidget {
  final RideHistoryItem ride;
  final VoidCallback onTap;

  const _RecentRideTile({required this.ride, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Material(
      color: colors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                height: 48,
                width: 48,
                decoration: BoxDecoration(
                  color: colors.background,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: colors.divider),
                ),
                child: Icon(
                  Icons.history,
                  color: colors.accentIcon,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${ride.fromAddress}  →  ${ride.toAddress}',
                      style: AppTextStyles.body.copyWith(
                          fontWeight: FontWeight.w600,
                          color: colors.textPrimary),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text('Sedan • AC',
                        style: AppTextStyles.caption
                            .copyWith(color: colors.textSecondary)),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: colors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}
