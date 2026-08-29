import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';

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
  String? _filter; // null means 'All'
  bool _loading = true;
  bool _refreshing = false;
  String _errorMsg = '';
  List<dynamic> _allRides = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() {
      if (!_refreshing) _loading = true;
      _errorMsg = '';
    });

    try {
      final res = await ApiService.get('/driver/bookings/rides/history');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'];
        if (data != null && data['rides'] != null) {
          _allRides = data['rides'];
        }
      } else {
        throw Exception('Failed to load rides');
      }
    } catch (e) {
      if (mounted) setState(() => _errorMsg = 'Failed to load rides. Please check your connection.');
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
          _refreshing = false;
        });
      }
    }
  }

  Future<void> _onRefresh() async {
    _refreshing = true;
    await _fetchData();
  }

  List<dynamic> get _filtered {
    if (_filter == null) return _allRides;
    return _allRides.where((r) {
      final status = r['rideStatus'] as String?;
      if (_filter == 'Upcoming' && ['driver_accepted', 'driver_arriving', 'confirmed'].contains(status)) return true;
      if (_filter == 'Ongoing' && status == 'in_progress') return true;
      if (_filter == 'Completed' && status == 'trip_completed') return true;
      if (_filter == 'Cancelled' && status != null && status.startsWith('cancelled')) return true;
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
                const Text('My Rides', style: AppText.cardHeadline),
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
                _filterChip('Upcoming', 'Upcoming'),
                const SizedBox(width: 8),
                _filterChip('Ongoing', 'Ongoing'),
                const SizedBox(width: 8),
                _filterChip('Completed', 'Completed'),
                const SizedBox(width: 8),
                _filterChip('Cancelled', 'Cancelled'),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _loading && !_refreshing
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
                                    subtitle: 'Rides matching this filter will show up here.',
                                  )
                                ],
                              )
                            : ListView.separated(
                                padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                                itemCount: _filtered.length,
                                separatorBuilder: (_, __) => const SizedBox(height: 14),
                                itemBuilder: (context, i) => _rideCard(context, _filtered[i]),
                              ),
                      ),
          ),
        ],
      ),
    );
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
        side: BorderSide(color: selected ? AppColors.gold.withOpacity(0.4) : AppColors.divider),
      ),
    );
  }

  Widget _rideCard(BuildContext context, dynamic ride) {
    final statusStr = ride['rideStatus'] as String? ?? 'unknown';
    final fare = (ride['finalFare'] ?? ride['estimatedFare'] ?? 0).toDouble();
    final pickup = ride['pickupLocation']?['address'] ?? 'Unknown Pickup';
    final drop = ride['dropoffLocation']?['address'] ?? 'Unknown Dropoff';
    final dist = (ride['distance'] ?? 0).toDouble();
    final date = ride['createdAt'] != null ? DateTime.parse(ride['createdAt']) : DateTime.now();

    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () => context.push('/rides/details', extra: {'rideId': ride['_id']}),
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
                  style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w800),
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
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 14), overflow: TextOverflow.ellipsis),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(left: 3.5),
              child: SizedBox(
                height: 16,
                child: VerticalDivider(color: AppColors.divider, thickness: 1, width: 1),
              ),
            ),
            Row(
              children: [
                Icon(Icons.location_on, size: 8, color: AppColors.textMuted),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(drop,
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
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
    String label = 'Unknown';

    if (['driver_accepted', 'driver_arriving', 'confirmed'].contains(statusStr)) {
      color = AppColors.info;
      label = 'Upcoming';
    } else if (statusStr == 'in_progress') {
      color = AppColors.success;
      label = 'Ongoing';
    } else if (statusStr == 'trip_completed') {
      color = AppColors.gold;
      label = 'Completed';
    } else if (statusStr.startsWith('cancelled')) {
      color = AppColors.error;
      label = 'Cancelled';
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
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
