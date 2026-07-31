import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/mock_data.dart';
import '../../core/models/ride.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/empty_state.dart';
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
  RideStatus? _filter;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _simulateInitialLoad();
  }

  // Simulates the first fetch so the skeleton loading state has something
  // to show. Swap for a real "await ridesRepository.fetch()" once the
  // Rides API exists.
  Future<void> _simulateInitialLoad() async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) setState(() => _loading = false);
  }

  List<Ride> get _filtered {
    final all = MockData.rides;
    if (_filter == null) return all;
    return all.where((r) => r.status == _filter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
            child: Row(
              children: [
                const Text('My Rides', style: AppText.cardHeadline),
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
                _filterChip('Upcoming', RideStatus.upcoming),
                const SizedBox(width: 8),
                _filterChip('Ongoing', RideStatus.ongoing),
                const SizedBox(width: 8),
                _filterChip('Completed', RideStatus.completed),
                const SizedBox(width: 8),
                _filterChip('Cancelled', RideStatus.cancelled),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _loading
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
                : _filtered.isEmpty
                    ? const Center(
                        child: EmptyState(
                          icon: Icons.local_taxi_outlined,
                          title: 'No rides here yet',
                          subtitle: 'Rides matching this filter will show up here.',
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                        itemCount: _filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 14),
                        itemBuilder: (context, i) => _rideCard(context, _filtered[i]),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, RideStatus? status) {
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

  Widget _rideCard(BuildContext context, Ride ride) {
    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () => context.push('/rides/details', extra: {'rideId': ride.id}),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: cardDecoration(radius: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _statusBadge(ride.status),
                Text(
                  '₹${ride.fare.toStringAsFixed(0)}',
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
                  child: Text(ride.pickupAddress,
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
                  child: Text(ride.dropAddress,
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
                  '${ride.customerName} · ${ride.distanceKm.toStringAsFixed(1)} km',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
                Text(
                  _formatDate(ride.dateTime),
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(RideStatus status) {
    final color = switch (status) {
      RideStatus.upcoming => AppColors.info,
      RideStatus.ongoing => AppColors.success,
      RideStatus.completed => AppColors.gold,
      RideStatus.cancelled => AppColors.error,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
      child: Text(
        status.label,
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
