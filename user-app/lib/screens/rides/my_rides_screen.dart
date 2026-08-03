// lib/screens/rides/my_rides_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_history_item.dart';
import '../../models/ride_request.dart';
import '../../models/upcoming_ride.dart';
import '../../widgets/back_button.dart';
import '../../routes/app_routes.dart';

/// My Rides — reached from Home > "View all" on Recent Rides (or wire a
/// dedicated nav entry point once the app grows a bottom nav bar).
///
/// Two tabs:
///   - "Upcoming": any active or scheduled ride (searching for a driver,
///     driver assigned/en route, or a future scheduled booking).
///   - "Past": completed/cancelled rides — same shape of data as
///     `RideHistoryScreen` (screens/profile/ride_history_screen.dart), just
///     shown without the "reached from Profile" framing.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only:
///   - Upcoming tab: see the full checklist in `models/upcoming_ride.dart`.
///     `_mockUpcoming` is hardcoded; a real integration should also poll or
///     subscribe (WebSocket) so status updates live rather than needing a
///     manual refresh. "Track" now pushes the existing `DriverAssignedScreen`
///     (see `_rideRequestFromUpcoming` below) but builds its `RideRequest`
///     from a guessed CarModel + placeholder LatLng pair — swap those for
///     the real pickup/drop coords and matched vehicle once the backend
///     returns them.
///   - Past tab: see `models/ride_history_item.dart` — same backend call as
///     `RideHistoryScreen`, so consider sharing one `RideService` call
///     between both screens instead of duplicating the fetch.
/// ===========================================================================
class MyRidesScreen extends StatefulWidget {
  const MyRidesScreen({super.key});

  @override
  State<MyRidesScreen> createState() => _MyRidesScreenState();
}

class _MyRidesScreenState extends State<MyRidesScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController =
      TabController(length: 2, vsync: this);

  // TODO(backend): GET /api/rides/active + GET /api/rides/scheduled — see
  // file header and models/upcoming_ride.dart.
  static const List<UpcomingRide> _mockUpcoming = [
    UpcomingRide(
      id: 'up_1',
      fromAddress: 'Home',
      toAddress: 'Bandra Kurla Complex',
      whenLabel: 'Now',
      vehicleLabel: 'Sedan',
      estimatedFare: '₹210 (estimated)',
      status: UpcomingRideStatus.driverAssigned,
    ),
    UpcomingRide(
      id: 'up_2',
      fromAddress: 'Home',
      toAddress: 'Chhatrapati Shivaji Airport',
      whenLabel: 'Tomorrow, 6:30 AM',
      vehicleLabel: 'SUV',
      estimatedFare: '₹540 (estimated)',
      status: UpcomingRideStatus.scheduled,
    ),
  ];

  // TODO(backend): GET /api/rides/history — same call RideHistoryScreen
  // uses; see models/ride_history_item.dart. Kept in sync with that
  // screen's mock list so the same ride shows identical detail either way.
  static const List<RideHistoryItem> _mockPast = [
    RideHistoryItem(
      id: 'ride_1',
      fromAddress: 'Home, Mumbai',
      toAddress: 'Lonavala Hill Station',
      dateLabel: '25 Jul 2026',
      fare: '₹5,850',
      status: RideStatus.completed,
      vehicleLabel: 'Sedan',
      carName: 'Swift Dzire',
      startDateLabel: '25 Jul 2026',
      returnDateLabel: '26 Jul 2026',
      numberOfDays: 2,
      distanceKm: 190,
      perDayRate: 2000,
      perKmRate: 15,
      driverName: 'Ramesh Kumar',
      driverRating: 4.8,
      plateNumber: 'KA 03 AB 4521',
      paymentLabel: 'UPI',
    ),
    RideHistoryItem(
      id: 'ride_2',
      fromAddress: 'Office, Bandra Kurla Complex',
      toAddress: 'Pune City Center',
      dateLabel: '18 Jul 2026',
      fare: '₹4,150',
      status: RideStatus.completed,
      vehicleLabel: 'MPV',
      carName: 'Maruti Suzuki Ertiga',
      startDateLabel: '18 Jul 2026',
      returnDateLabel: '18 Jul 2026',
      numberOfDays: 1,
      distanceKm: 150,
      perDayRate: 2500,
      perKmRate: 17,
      driverName: 'Suresh Patil',
      driverRating: 4.6,
      plateNumber: 'MH 12 CD 7734',
      paymentLabel: 'Cash',
    ),
    RideHistoryItem(
      id: 'ride_4',
      fromAddress: 'Home, Mumbai',
      toAddress: 'Nashik Vineyards',
      dateLabel: '12 Jun 2026',
      fare: '₹0',
      status: RideStatus.cancelled,
      vehicleLabel: 'Sedan',
      carName: 'Hyundai Aura',
      startDateLabel: '12 Jun 2026',
      cancellationReason: 'Cancelled by rider before driver assignment — no charge applied.',
    ),
  ];

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // TODO(backend): once `GET /api/rides/active` returns real pickup/drop
  // coordinates and the matched vehicle, replace this mock-to-RideRequest
  // mapping with the actual data instead of guessing a CarModel from
  // `vehicleLabel` and a placeholder LatLng pair.
  RideRequest _rideRequestFromUpcoming(UpcomingRide ride) {
    final matchedCar = mockCarModels.firstWhere(
      (car) => car.category.label == ride.vehicleLabel,
      orElse: () => mockCarModels.first,
    );
    return RideRequest(
      pickupAddress: ride.fromAddress,
      pickupLatLng: const LatLng(19.0760, 72.8777), // mock — Mumbai
      dropAddress: ride.toAddress,
      dropLatLng: const LatLng(19.0896, 72.8656), // mock — nearby offset
      selectedCar: matchedCar,
    );
  }

  void _trackRide(UpcomingRide ride) {
    Navigator.of(context).pushNamed(
      AppRoutes.driverAssigned,
      arguments: _rideRequestFromUpcoming(ride),
    );
  }

  Future<void> _cancelScheduledRide(UpcomingRide ride) async {
    final colors = AppColors.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: colors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Cancel this ride?', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
        content: Text(
          '${ride.fromAddress} → ${ride.toAddress}, ${ride.whenLabel}',
          style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text('Keep it', style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(
              'Cancel Ride',
              style: AppTextStyles.body.copyWith(
                color: Colors.redAccent,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      // TODO(backend): DELETE /api/rides/scheduled/{id}
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ride cancelled')),
      );
    }
  }

  void _openPastRideDetails(RideHistoryItem ride) {
    Navigator.of(context).pushNamed(AppRoutes.rideDetails, arguments: ride);
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
              child: _buildTopBar(),
            ),
            const SizedBox(height: 16),
            _buildTabBar(),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildUpcomingTab(),
                  _buildPastTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Row(
      children: [
        AppBackButton(onPressed: () => Navigator.of(context).pop()),
        const SizedBox(width: 16),
        Text('My Rides', style: AppTextStyles.mediumHeading),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildTabBar() {
    final colors = AppColors.of(context);
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          color: AppColors.primaryGold,
          borderRadius: BorderRadius.circular(14),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        indicatorPadding: const EdgeInsets.all(4),
        dividerColor: Colors.transparent,
        labelColor: AppColors.textOnGold,
        unselectedLabelColor: colors.textSecondary,
        labelStyle: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600),
        unselectedLabelStyle: AppTextStyles.body,
        tabs: const [
          Tab(text: 'Upcoming'),
          Tab(text: 'Past'),
        ],
      ),
    ).animate().fadeIn(delay: 80.ms, duration: 300.ms);
  }

  Widget _buildUpcomingTab() {
    if (_mockUpcoming.isEmpty) {
      return _buildEmptyState(
        icon: Icons.event_available_outlined,
        message: 'No upcoming rides.\nBook one from Home.',
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      itemCount: _mockUpcoming.length,
      itemBuilder: (context, index) {
        final ride = _mockUpcoming[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _UpcomingRideCard(
            ride: ride,
            onPrimaryAction: () => ride.status == UpcomingRideStatus.scheduled
                ? null
                : _trackRide(ride),
            onCancel: ride.status == UpcomingRideStatus.scheduled
                ? () => _cancelScheduledRide(ride)
                : null,
            onTrack: ride.status != UpcomingRideStatus.scheduled
                ? () => _trackRide(ride)
                : null,
          ),
        );
      },
    );
  }

  Widget _buildPastTab() {
    if (_mockPast.isEmpty) {
      return _buildEmptyState(
        icon: Icons.history,
        message: 'No past rides yet.',
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      itemCount: _mockPast.length,
      itemBuilder: (context, index) {
        final ride = _mockPast[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _PastRideTile(
            ride: ride,
            onTap: () => _openPastRideDetails(ride),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState({required IconData icon, required String message}) {
    final colors = AppColors.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: colors.textSecondary, size: 40),
            const SizedBox(height: 12),
            Text(message, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _UpcomingRideCard extends StatelessWidget {
  final UpcomingRide ride;
  final VoidCallback? onPrimaryAction;
  final VoidCallback? onCancel;
  final VoidCallback? onTrack;

  const _UpcomingRideCard({
    required this.ride,
    this.onPrimaryAction,
    this.onCancel,
    this.onTrack,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final isScheduled = ride.status == UpcomingRideStatus.scheduled;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primaryGold.withOpacity(0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryGold.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  ride.status.label,
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.primaryGold,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              Text(ride.whenLabel, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: colors.background,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.directions_car_filled_outlined,
                  color: AppColors.primaryGold,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${ride.fromAddress}  →  ${ride.toAddress}',
                      style: AppTextStyles.body.copyWith(color: colors.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${ride.vehicleLabel} · ${ride.estimatedFare}',
                      style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              if (onTrack != null)
                Expanded(
                  child: OutlinedButton(
                    onPressed: onTrack,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: AppColors.primaryGold),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      'Track',
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.primaryGold,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              if (isScheduled && onCancel != null)
                Expanded(
                  child: OutlinedButton(
                    onPressed: onCancel,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: Colors.redAccent),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      'Cancel',
                      style: AppTextStyles.body.copyWith(
                        color: Colors.redAccent,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PastRideTile extends StatelessWidget {
  final RideHistoryItem ride;
  final VoidCallback onTap;

  const _PastRideTile({required this.ride, required this.onTap});

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
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: colors.background,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.directions_car_filled_outlined,
                  color: AppColors.primaryGold,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${ride.fromAddress}  →  ${ride.toAddress}',
                      style: AppTextStyles.body.copyWith(color: colors.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(ride.dateLabel, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    ride.fare,
                    style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    ride.status.label,
                    style: AppTextStyles.caption.copyWith(color: ride.status.color),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
