import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/mock_data.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/skeleton_loader.dart';

/// Dashboard Screen - Main hub for the driver.
/// Wiring this to MockData for now since backend is still under dev.
/// AI/Backend: once the real API is ready, we'll swap MockData with a proper 
/// DashboardProvider or Repository call here.
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _online = false;
  bool _refreshing = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _simulateInitialLoad();
  }

  // Simulates the first data fetch so the skeleton loading state has
  // something to show. Swap for a real "await repository.load()" once the
  // Dashboard API exists.
  Future<void> _simulateInitialLoad() async {
    await Future.delayed(const Duration(milliseconds: 700));
    if (mounted) setState(() => _loading = false);
  }

  // Simulate a pull-to-refresh. In production, this should re-fetch 
  // from the Dashboard API endpoint.
  Future<void> _onRefresh() async {
    setState(() => _refreshing = true);
    await Future.delayed(const Duration(milliseconds: 1000));
    if (mounted) setState(() => _refreshing = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return SafeArea(child: _dashboardSkeleton());
    }

    // Grabbing data from MockData for UI rendering
    final profile = MockData.driverProfile;
    final ongoingRide = MockData.currentRide;
    final nextRide = MockData.upcomingRides.isNotEmpty ? MockData.upcomingRides.first : null;
    final recentTxns = MockData.transactions.take(3).toList();

    return SafeArea(
      child: RefreshIndicator(
        color: AppColors.gold,
        backgroundColor: AppColors.surface,
        onRefresh: _onRefresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- Header Section ---
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Good Morning', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                      const SizedBox(height: 4),
                      Text(profile.name, style: AppText.cardHeadline),
                    ],
                  ),
                  InkWell(
                    onTap: () => context.push('/tabs?tab=3'),
                    borderRadius: BorderRadius.circular(22),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.gold, width: 2),
                      ),
                      child: const Icon(Icons.person, color: AppColors.gold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // --- Online/Offline Toggle ---
              // TODO: Backend - this needs to hit the 'update-status' endpoint
              Container(
                padding: const EdgeInsets.all(20),
                decoration: cardDecoration(radius: 24, context: context),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _online ? AppColors.success : AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 12),
                          Text(
                            _online ? "You're Online" : "You're Offline",
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                          ),
                      ],
                    ),
                    Switch(
                      value: _online,
                      activeColor: Colors.black,
                      activeTrackColor: AppColors.gold,
                      inactiveTrackColor: AppColors.divider,
                      onChanged: (v) => setState(() => _online = v),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // --- Stat Cards ---
              Row(
                children: [
                  Expanded(
                    child: _statCard(
                      Icons.trending_up, 
                      AppColors.gold, 
                      "Today's Earnings", 
                      '₹${MockData.todayEarnings.toInt()}',
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _statCard(
                      Icons.local_taxi, 
                      AppColors.info, 
                      'Trips Today', 
                      '${MockData.tripsToday}',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // --- Active/Next Ride Card ---
              if (ongoingRide != null || nextRide != null) ...[
                Text(
                  ongoingRide != null ? 'Active Ride' : 'Upcoming Ride', 
                  style: AppText.sectionTitle,
                ),
                const SizedBox(height: 12),
                InkWell(
                  onTap: () {
                    if (ongoingRide != null) {
                      context.push('/rides/current');
                    } else {
                      context.push('/rides/details', extra: {'rideId': nextRide!.id});
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: rideCardDecoration(radius: 24, context: context),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          Icon(
                            ongoingRide != null ? Icons.directions_car : Icons.access_time, 
                            size: 16, 
                            color: AppColors.gold,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            ongoingRide != null ? 'Trip in progress' : 'Pickup expected soon', 
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                          ),
                        ]),
                        const SizedBox(height: 12),
                        Text(
                          (ongoingRide ?? nextRide)!.pickupAddress, 
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '→  ${(ongoingRide ?? nextRide)!.dropAddress}', 
                          style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // --- Quick Actions ---
              const Text('Quick Actions', style: AppText.sectionTitle),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _quickAction(Icons.notifications_active_outlined, 'New Ride', () => _simulateIncomingRequest(context))),
                  const SizedBox(width: 12),
                  Expanded(child: _quickAction(Icons.support_agent, 'Support', () => context.push('/profile/help'))),
                  const SizedBox(width: 12),
                  Expanded(child: _quickAction(Icons.receipt_long, 'History', () => context.push('/tabs?tab=1'))),
                  const SizedBox(width: 12),
                  Expanded(child: _quickAction(Icons.settings, 'Settings', () => context.push('/tabs?tab=3'))),
                ],
              ),
              const SizedBox(height: 24),

              // --- Recent Activity Feed ---
              const Text('Recent Activity', style: AppText.sectionTitle),
              const SizedBox(height: 12),
              Container(
                decoration: cardDecoration(bg: Theme.of(context).brightness == Brightness.dark ? AppColors.surfaceAlt : AppColors.surfaceAltLight, radius: 24, context: context),
                padding: const EdgeInsets.all(8),
                child: Column(
                  children: List.generate(recentTxns.length, (i) {
                    final txn = recentTxns[i];
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        border: i < recentTxns.length - 1
                            ? Border(bottom: BorderSide(color: Theme.of(context).brightness == Brightness.dark ? AppColors.borderSubtle : AppColors.borderSubtleLight))
                            : null,
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: const BoxDecoration(color: AppColors.goldTint, shape: BoxShape.circle),
                            child: const Icon(Icons.check, color: AppColors.gold, size: 18),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(txn.title, style: const TextStyle(fontSize: 14)),
                          ),
                          Text(
                            '₹${txn.amount.toInt()}', 
                            style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ],
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Opens the "New Ride Request" screen using the next upcoming mock ride,
  // as a stand-in for a real incoming-request push (no dispatch/matching
  // backend exists yet — see BACKEND_API_SPEC.md).
  void _simulateIncomingRequest(BuildContext context) {
    final nextRide = MockData.upcomingRides.isNotEmpty ? MockData.upcomingRides.first : null;
    if (nextRide == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No incoming requests right now')),
      );
      return;
    }
    context.push('/rides/incoming', extra: {'rideId': nextRide.id});
  }

  Widget _dashboardSkeleton() {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SkeletonBox(width: 90, height: 12),
                  SizedBox(height: 8),
                  SkeletonBox(width: 140, height: 20),
                ],
              ),
              SkeletonBox(width: 44, height: 44, radius: 22),
            ],
          ),
          const SizedBox(height: 24),
          const SkeletonCard(height: 24),
          const SizedBox(height: 16),
          Row(
            children: const [
              Expanded(child: SkeletonCard(height: 60)),
              SizedBox(width: 16),
              Expanded(child: SkeletonCard(height: 60)),
            ],
          ),
          const SizedBox(height: 24),
          const SkeletonCard(height: 90),
          const SizedBox(height: 24),
          Row(
            children: const [
              Expanded(child: SkeletonCard(height: 56)),
              SizedBox(width: 12),
              Expanded(child: SkeletonCard(height: 56)),
              SizedBox(width: 12),
              Expanded(child: SkeletonCard(height: 56)),
              SizedBox(width: 12),
              Expanded(child: SkeletonCard(height: 56)),
            ],
          ),
          const SizedBox(height: 24),
          const SkeletonCard(height: 140),
        ],
      ),
    );
  }

  Widget _statCard(IconData icon, Color color, String label, String value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: rideCardDecoration(context: context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.goldTint,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _quickAction(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: cardDecoration(radius: 16, context: context),
        child: Column(
          children: [
            Icon(icon, color: AppColors.gold, size: 22),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
