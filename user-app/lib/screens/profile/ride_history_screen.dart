// lib/screens/profile/ride_history_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_history_item.dart';
import '../../widgets/back_button.dart';
import '../../routes/app_routes.dart';

/// Ride History — reached from Profile > "Ride History".
///
/// Full list of past (completed/cancelled) rides with a status filter.
/// The "Past" tab on My Rides (screens/rides/my_rides_screen.dart) shows
/// the same kind of data in summary form — this screen is the full,
/// filterable list. Tapping a row pushes `RideDetailsScreen`.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only — see the full checklist in `models/ride_history_item.dart`.
/// In short: `_mockHistory` here is hardcoded; replace with a paginated
/// `GET /api/rides/history` call. Row taps already push a real
/// `RideDetailsScreen` (screens/rides/ride_details_screen.dart) — make sure
/// whatever the real endpoint returns includes the detail-only fields on
/// `RideHistoryItem` (car name, dates, distance, rates, driver, payment),
/// not just the row subset, or that screen's sections will just hide
/// themselves instead of showing real data.
/// ===========================================================================
class RideHistoryScreen extends StatefulWidget {
  const RideHistoryScreen({super.key});

  @override
  State<RideHistoryScreen> createState() => _RideHistoryScreenState();
}

class _RideHistoryScreenState extends State<RideHistoryScreen> {
  // TODO(backend): GET /api/rides/history?status=&page= — see file header.
  static const List<RideHistoryItem> _mockHistory = [
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
      id: 'ride_3',
      fromAddress: 'Bandra Kurla Complex',
      toAddress: 'Goa (Panaji)',
      dateLabel: '9 Jul 2026',
      fare: '₹19,400',
      status: RideStatus.completed,
      vehicleLabel: 'SUV',
      carName: 'Mahindra Scorpio',
      startDateLabel: '9 Jul 2026',
      returnDateLabel: '12 Jul 2026',
      numberOfDays: 4,
      distanceKm: 590,
      perDayRate: 3000,
      perKmRate: 18,
      driverName: 'Arjun Nair',
      driverRating: 4.9,
      plateNumber: 'KA 05 EF 1190',
      paymentLabel: 'Visa •••• 4242',
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

  String _filter = 'All';

  List<RideHistoryItem> get _filtered {
    if (_filter == 'All') return _mockHistory;
    final status = _filter == 'Completed' ? RideStatus.completed : RideStatus.cancelled;
    return _mockHistory.where((r) => r.status == status).toList();
  }

  void _openRideDetails(RideHistoryItem ride) {
    Navigator.of(context).pushNamed(AppRoutes.rideDetails, arguments: ride);
  }

  @override
  Widget build(BuildContext context) {
    final rides = _filtered;

    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
              child: _buildTopBar(),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: _buildFilterChips(),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: rides.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
                      itemCount: rides.length,
                      itemBuilder: (context, index) {
                        final ride = rides[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _RideHistoryTile(
                            ride: ride,
                            onTap: () => _openRideDetails(ride),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    final colors = AppColors.of(context);
    return Row(
      children: [
        AppBackButton(onPressed: () => Navigator.of(context).pop()),
        const SizedBox(width: 16),
        Text('Ride History', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildFilterChips() {
    final colors = AppColors.of(context);
    const options = ['All', 'Completed', 'Cancelled'];
    return Row(
      children: options.map((option) {
        final selected = _filter == option;
        return Padding(
          padding: const EdgeInsets.only(right: 10),
          child: GestureDetector(
            onTap: () => setState(() => _filter = option),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
              decoration: BoxDecoration(
                color: selected ? AppColors.primaryGold : colors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: selected ? AppColors.primaryGold : colors.inputBorder,
                ),
              ),
              child: Text(
                option,
                style: AppTextStyles.caption.copyWith(
                  color: selected ? AppColors.textOnGold : colors.textSecondary,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    ).animate().fadeIn(delay: 80.ms, duration: 300.ms);
  }

  Widget _buildEmptyState() {
    final colors = AppColors.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.history, color: colors.textSecondary, size: 40),
            const SizedBox(height: 12),
            Text(
              'No rides in this filter yet',
              style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _RideHistoryTile extends StatelessWidget {
  final RideHistoryItem ride;
  final VoidCallback onTap;

  const _RideHistoryTile({required this.ride, required this.onTap});

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
                    Text(
                      '${ride.dateLabel} · ${ride.vehicleLabel}',
                      style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: ride.status.color.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        ride.status.label,
                        style: AppTextStyles.caption.copyWith(
                          color: ride.status.color,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
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
