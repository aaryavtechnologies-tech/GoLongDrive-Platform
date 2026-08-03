// lib/screens/home/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_history_item.dart';
import '../../widgets/primary_button.dart';
import '../../routes/app_routes.dart';

/// Home screen — basic ride-booking dashboard.
///
/// UI-only: search bar is a non-functional input (no places/autocomplete
/// yet), the map is a static placeholder panel, and recent rides are mock
/// data. All tap targets show a SnackBar or no-op until backend/map/booking
/// integration lands in a later phase. The profile icon opens the (also
/// UI-only) Profile screen, and "View all" on Recent Rides opens the (also
/// UI-only) My Rides screen — see screens/rides/my_rides_screen.dart.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static const List<RideHistoryItem> _mockRecentRides = [
    RideHistoryItem(
      id: 'recent_1',
      fromAddress: 'Home',
      toAddress: 'Andheri West Station',
      dateLabel: 'Yesterday, 6:42 PM',
      fare: '₹186',
      status: RideStatus.completed,
      vehicleLabel: 'Sedan',
    ),
    RideHistoryItem(
      id: 'recent_2',
      fromAddress: 'Office',
      toAddress: 'Phoenix Marketcity',
      dateLabel: 'Mon, 1:15 PM',
      fare: '₹224',
      status: RideStatus.completed,
      vehicleLabel: 'Sedan',
    ),
    RideHistoryItem(
      id: 'recent_3',
      fromAddress: 'Bandra Kurla Complex',
      toAddress: 'Home',
      dateLabel: 'Sat, 9:03 PM',
      fare: '₹310',
      status: RideStatus.completed,
      vehicleLabel: 'MPV',
    ),
  ];

  void _showComingSoon(BuildContext context, String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$feature — coming soon')),
    );
  }

  void _openProfile(BuildContext context) {
    Navigator.of(context).pushNamed(AppRoutes.profile);
  }

  void _startBooking(BuildContext context) {
    Navigator.of(context).pushNamed(AppRoutes.setLocations);
  }

  void _openMyRides(BuildContext context) {
    Navigator.of(context).pushNamed(AppRoutes.myRides);
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          children: [
            _buildHeader(context),
            const SizedBox(height: 24),
            _buildSearchBar(context),
            const SizedBox(height: 20),
            _buildMapPlaceholder(context),
            const SizedBox(height: 16),
            PrimaryButton(
              label: 'Book a Ride',
              onPressed: () => _startBooking(context),
            ),
            const SizedBox(height: 32),
            _buildRecentRidesSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Hi there 👋', style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
              const SizedBox(height: 4),
              Text(
                'Where would you like to go?',
                style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Semantics(
          button: true,
          label: 'Open profile',
          child: ExcludeSemantics(
            child: GestureDetector(
          onTap: () => _openProfile(context),
          child: Container(
            height: 44,
            width: 44,
            decoration: BoxDecoration(
              color: colors.surface,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.person_outline, color: colors.textPrimary),
          ),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildSearchBar(BuildContext context) {
    final colors = AppColors.of(context);
    return GestureDetector(
      onTap: () => _startBooking(context),
      child: Container(
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: 18),
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: colors.inputBorder),
        ),
        child: Row(
          children: [
            Icon(Icons.search, color: colors.textSecondary, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Text('Search destination', style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildMapPlaceholder(BuildContext context) {
    final colors = AppColors.of(context);
    return GestureDetector(
      onTap: () => _showComingSoon(context, 'Live map'),
      child: Container(
        height: 200,
        width: double.infinity,
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: colors.inputBorder),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.map_outlined, color: colors.accentIcon, size: 36),
            const SizedBox(height: 10),
            Text('Map preview coming soon', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 150.ms, duration: 300.ms);
  }

  Widget _buildRecentRidesSection(BuildContext context) {
    final colors = AppColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Recent Rides', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
            GestureDetector(
              onTap: () => _openMyRides(context),
              child: Text('View all', style: AppTextStyles.link),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ..._mockRecentRides.map(
              (ride) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _RecentRideTile(
              ride: ride,
              onTap: () => Navigator.of(context)
                  .pushNamed(AppRoutes.rideDetails, arguments: ride),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
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
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(ride.dateLabel, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                ride.fare,
                style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}