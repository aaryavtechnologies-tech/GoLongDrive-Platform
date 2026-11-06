import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../city_rides/city_ride_model.dart';
import '../city_rides/city_rides_service.dart';

import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_loader.dart';

/// Matches app/(tabs)/rides.tsx (§5.9) — My Rides tab.
/// Filter chip row (All/Upcoming/Completed/Cancelled) over a list of ride
/// cards. Tapping a card opens Ride Details (screen not built yet — see
/// PROJECT_STATUS.md item 36; the route falls back to a placeholder for
/// now so this screen doesn't crash on tap).
class RidesScreen extends StatefulWidget {
  const RidesScreen({super.key});

  @override
  State<RidesScreen> createState() => _RidesScreenState();
}

class _RidesScreenState extends State<RidesScreen> {
  final CityRidesService _cityRidesService = CityRidesService.instance;
  String? _filter; // null means 'All'
  bool _loading = true;
  bool _refreshing = false;
  String _errorMsg = '';
  List<dynamic> _allRides = [];

  @override
  void initState() {
    super.initState();
    ThemeService.instance.themeMode.addListener(_onThemeUpdated);
    _cityRidesService.initialize();
    _fetchData();
  }

  void _onThemeUpdated() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    ThemeService.instance.themeMode.removeListener(_onThemeUpdated);
    super.dispose();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() {
      if (!_refreshing) _loading = true;
      _errorMsg = '';
    });

    try {
      final futures = await Future.wait([
        ApiService.get('/driver/bookings/rides/history'),
        ApiService.get('/driver/bookings/rides/available'),
      ]);

      List<dynamic> combined = [];

      if (futures[0].statusCode == 200) {
        final data = jsonDecode(futures[0].body)['data'];
        if (data != null && data['rides'] != null) {
          combined.addAll(data['rides']);
        }
      } else {
        throw Exception('Failed to load rides history');
      }

      if (futures[1].statusCode == 200) {
        final data = jsonDecode(futures[1].body)['data'];
        if (data != null && data['rides'] != null) {
          combined.addAll(data['rides']);
        }
      }

      // Sort: Active rides first, then newest first
      combined.sort((a, b) {
        final aActive = _isActiveStatus((a['rideStatus'] ?? '').toString());
        final bActive = _isActiveStatus((b['rideStatus'] ?? '').toString());
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;

        final aDate = DateTime.tryParse((a['createdAt'] ?? '').toString()) ?? DateTime(2000);
        final bDate = DateTime.tryParse((b['createdAt'] ?? '').toString()) ?? DateTime(2000);
        return bDate.compareTo(aDate);
      });

      _allRides = combined;
    } catch (e) {
      if (mounted) {
        setState(() =>
            _errorMsg = 'Failed to load rides. Please check your connection.');
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
          _refreshing = false;
        });
      }
    }
  }

  bool _isActiveStatus(String status) {
    final s = status.toLowerCase();
    return s == 'in_progress' ||
        status == 'Trip Started' ||
        s == 'trip_started' ||
        s == 'driver_accepted' ||
        status == 'Driver Accepted' ||
        s == 'driver_arriving' ||
        status == 'Driver Arriving' ||
        s == 'driver_arrived' ||
        status == 'Driver Arrived' ||
        s == 'confirmed' ||
        status == 'Confirmed' ||
        status == 'Awaiting Payment';
  }

  /// 24-hour clearing rule:
  /// Active rides are ALWAYS shown so drivers never lose ongoing rides.
  /// Available, completed, or cancelled rides older than 24 hours are cleared.
  bool _isWithin24Hours(dynamic r) {
    final status = (r['rideStatus'] ?? '').toString();
    if (_isActiveStatus(status)) return true;

    final dateStr = r['completedAt'] ?? r['createdAt'] ?? r['pickupDate'];
    if (dateStr == null) return true;
    final rideTime = DateTime.tryParse(dateStr.toString());
    if (rideTime == null) return true;

    final diff = DateTime.now().difference(rideTime);
    // If completed/requested over 24 hours ago, clear it from the daily view
    return diff.inHours < 24;
  }

  Future<void> _onRefresh() async {
    _refreshing = true;
    await _fetchData();
  }

  List<dynamic> get _filtered {
    // Apply 24h clearing filter first
    final activeOrRecent = _allRides.where(_isWithin24Hours).toList();

    if (_filter == null) return activeOrRecent;

    return activeOrRecent.where((r) {
      final status = (r['rideStatus'] ?? '').toString();
      final s = status.toLowerCase();

      if (_filter == 'Available') {
        return status == 'Searching Driver' || s == 'searching_driver' || s == 'available' || s == 'pending';
      }
      if (_filter == 'Upcoming') {
        return ['driver_accepted', 'driver_arriving', 'driver_arrived', 'confirmed'].contains(s) ||
               ['Driver Accepted', 'Driver Arriving', 'Driver Arrived', 'Confirmed'].contains(status);
      }
      if (_filter == 'Ongoing') {
        return status == 'Trip Started' || s == 'in_progress' || s == 'trip_started' || status == 'Awaiting Payment';
      }
      if (_filter == 'Completed') {
        return status == 'Trip Completed' || s == 'trip_completed' || s == 'completed';
      }
      if (_filter == 'Cancelled') {
        return s.startsWith('cancel');
      }
      return false;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('My Rides', style: AppText.cardHeadline),
                    const SizedBox(height: 2),
                    Text('Active & last 24h requests • Refreshes daily',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                  ],
                ),
                IconButton(
                  icon: Icon(Icons.refresh, color: AppColors.textSecondary),
                  onPressed: _onRefresh,
                )
              ],
            ),
          ),
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              children: [
                _filterChip('All', null),
                const SizedBox(width: 8),
                _filterChip('Available', 'Available'),
                const SizedBox(width: 8),
                _filterChip('Upcoming', 'Upcoming'),
                const SizedBox(width: 8),
                _filterChip('Ongoing', 'Ongoing'),
                const SizedBox(width: 8),
                _filterChip('Completed', 'Completed'),
                const SizedBox(width: 8),
                _filterChip('City Rides', 'City Rides'),
                const SizedBox(width: 8),
                _filterChip('Cancelled', 'Cancelled'),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _filter == 'City Rides'
                ? ValueListenableBuilder<List<CityRideRequest>>(
                    valueListenable: _cityRidesService.completedRides,
                    builder: (context, rides, child) {
                      final completed = rides
                          .where(
                              (ride) => ride.status == CityRideStatus.completed)
                          .toList()
                        ..sort((a, b) => (b.completedAt ?? b.createdAt)
                            .compareTo(a.completedAt ?? a.createdAt));
                      return _buildCityRidesHistory(completed);
                    },
                  )
                : _loading && !_refreshing
                    ? ListView(
                        padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                        children: List.generate(
                          4,
                          (_) => const Padding(
                            padding: EdgeInsets.only(bottom: 14),
                            child: SkeletonCard(height: 90),
                          ),
                        ),
                      )
                    : _errorMsg.isNotEmpty && !_refreshing
                        ? ErrorStateWidget(
                            title: 'Oops!',
                            message: _errorMsg,
                            onRetry: _onRefresh,
                          )
                        : RefreshIndicator(
                            color: AppColors.gold,
                            backgroundColor: AppColors.surface,
                            onRefresh: _onRefresh,
                            child: _filtered.isEmpty
                                ? ListView(
                                    children: const [
                                      SizedBox(height: 100),
                                      EmptyState(
                                        icon: Icons.local_taxi_outlined,
                                        title: 'No rides found',
                                        subtitle:
                                            'Rides matching this filter will show up here.',
                                      )
                                    ],
                                  )
                                : ListView.separated(
                                    padding: const EdgeInsets.fromLTRB(
                                        24, 8, 24, 100),
                                    itemCount: _filtered.length,
                                    separatorBuilder: (_, __) =>
                                        const SizedBox(height: 14),
                                    itemBuilder: (context, i) =>
                                        _rideCard(context, _filtered[i]),
                                  ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildCityRidesHistory(List<CityRideRequest> rides) {
    if (rides.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: const [
          SizedBox(height: 100),
          EmptyState(
            icon: Icons.location_city_rounded,
            title: 'No completed city rides',
            subtitle: 'Your completed local trips will appear here.',
          ),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
      itemCount: rides.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) => _cityRideCard(rides[index]),
    );
  }

  Widget _cityRideCard(CityRideRequest ride) {
    final date = ride.completedAt ?? ride.createdAt;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: cardDecoration(radius: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'City Ride',
                  style: TextStyle(
                    color: AppColors.gold,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                '₹${ride.estimatedFare.toStringAsFixed(0)}',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            ride.riderName,
            style: TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          _cityRouteLine(
            Icons.circle,
            AppColors.gold,
            ride.pickupAddress,
          ),
          const SizedBox(height: 8),
          _cityRouteLine(
            Icons.location_on,
            AppColors.textMuted,
            ride.dropAddress,
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${ride.tripDistanceKm.toStringAsFixed(1)} km · ${ride.paymentMethod}',
                style: TextStyle(color: AppColors.textMuted, fontSize: 12),
              ),
              Text(
                _formatDateTime(date),
                style: TextStyle(color: AppColors.textMuted, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _cityRouteLine(IconData icon, Color color, String address) {
    return Row(
      children: [
        Icon(icon, size: 10, color: color),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            address,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  String _formatDateTime(DateTime date) {
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');
    return '${_formatDate(date)} · $hour:$minute';
  }

  Widget _filterChip(String label, String? status) {
    final selected = _filter == status;
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => setState(() => _filter = status),
      showCheckmark: false,
      backgroundColor: AppColors.surface,
      selectedColor: AppColors.goldTint,
      labelStyle: TextStyle(
        color: selected ? AppColors.gold : AppColors.textSecondary,
        fontWeight: FontWeight.w600,
        fontSize: 13,
      ),
      shape: StadiumBorder(
        side: BorderSide(
            color: selected
                ? AppColors.gold.withValues(alpha: 0.4)
                : AppColors.divider),
      ),
    );
  }

  Widget _rideCard(BuildContext context, dynamic ride) {
    final statusStr = ride['rideStatus'] as String? ?? 'unknown';
    final fare = (ride['finalFare'] ?? ride['estimatedFare'] ?? 0).toDouble();
    final pickup = ride['pickupAddress'] ?? ride['pickupLocation']?['address'] ?? 'Unknown Pickup';
    final drop = ride['dropAddress'] ?? ride['dropoffLocation']?['address'] ?? 'Unknown Dropoff';
    final dist = (ride['distance'] ?? 0).toDouble();
    final date = ride['createdAt'] != null
        ? DateTime.parse(ride['createdAt'])
        : DateTime.now();

    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () =>
          context.push('/rides/details', extra: {'rideId': ride['_id'], 'ride': ride}),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: cardDecoration(radius: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _statusBadge(statusStr),
                Text(
                  '₹${fare.toStringAsFixed(0)}',
                  style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.w800),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.circle, size: 8, color: AppColors.gold),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(pickup,
                      style:
                          TextStyle(color: AppColors.textPrimary, fontSize: 14),
                      overflow: TextOverflow.ellipsis),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(left: 3.5),
              child: SizedBox(
                height: 16,
                child: VerticalDivider(
                    color: AppColors.divider, thickness: 1, width: 1),
              ),
            ),
            Row(
              children: [
                Icon(Icons.location_on, size: 8, color: AppColors.textMuted),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(drop,
                      style: TextStyle(
                          color: AppColors.textSecondary, fontSize: 14),
                      overflow: TextOverflow.ellipsis),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Customer · ${dist.toStringAsFixed(1)} km',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
                Text(
                  _formatDate(date),
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String statusStr) {
    Color color = AppColors.textSecondary;
    String label = statusStr;

    final s = statusStr.toLowerCase();

    if (statusStr == 'Searching Driver' || s == 'searching_driver' || s == 'available' || s == 'pending') {
      color = AppColors.info;
      label = 'Available';
    } else if (['driver_accepted', 'driver_arriving', 'driver_arrived', 'confirmed'].contains(s) ||
        ['Driver Accepted', 'Driver Arriving', 'Driver Arrived', 'Confirmed'].contains(statusStr)) {
      color = AppColors.info;
      label = 'Upcoming';
    } else if (statusStr == 'Trip Started' || s == 'in_progress' || s == 'trip_started' || statusStr == 'Awaiting Payment') {
      color = AppColors.success;
      label = 'Ongoing';
    } else if (statusStr == 'Trip Completed' || s == 'trip_completed' || s == 'completed') {
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
          borderRadius: BorderRadius.circular(20)),
      child: Text(
        label,
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
