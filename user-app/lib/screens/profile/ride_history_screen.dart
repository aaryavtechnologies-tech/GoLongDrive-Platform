// lib/screens/profile/ride_history_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_history_item.dart';
import '../../widgets/back_button.dart';
import '../../routes/app_routes.dart';

import '../../core/services/booking_service.dart';

class RideHistoryScreen extends StatefulWidget {
  const RideHistoryScreen({super.key});

  @override
  State<RideHistoryScreen> createState() => _RideHistoryScreenState();
}

class _RideHistoryScreenState extends State<RideHistoryScreen> {
  List<RideHistoryItem> _history = [];
  bool _isLoading = true;
  String _filter = 'All';

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    try {
      setState(() => _isLoading = true);
      final bookings = await BookingService.getMyBookings();
      final List<RideHistoryItem> list = [];
      for (final b in bookings) {
        final from = b['pickupLocation']?['address'] ?? b['from'] ?? 'Unknown';
        final to = b['dropLocation']?['address'] ?? b['to'] ?? 'Unknown';
        final fare = b['fareAmount'] != null ? '₹${b['fareAmount']}' : (b['total'] ?? '');
        final date = b['pickupDate'] ?? b['date'] ?? '';
        final statusStr = b['status']?.toString().toLowerCase() ?? '';
        final status = statusStr.contains('cancel')
            ? RideStatus.cancelled
            : RideStatus.completed;

        list.add(RideHistoryItem(
          id: b['_id'] ?? b['id'] ?? '',
          fromAddress: from,
          toAddress: to,
          dateLabel: date,
          fare: fare,
          status: status,
          vehicleLabel: b['vehicleType'] ?? 'Car',
          carName: b['vehicleType'] ?? 'Car',
          driverName: b['driver']?['fullName'],
          driverRating: 4.8,
          plateNumber: b['vehicle']?['registrationNumber'],
          paymentLabel: b['paymentMethod'] ?? 'Online',
        ));
      }
      if (mounted) {
        setState(() {
          _history = list;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<RideHistoryItem> get _filtered {
    if (_filter == 'All') return _history;
    final status = _filter == 'Completed' ? RideStatus.completed : RideStatus.cancelled;
    return _history.where((r) => r.status == status).toList();
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
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.primaryGold),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetchHistory,
                      color: AppColors.primaryGold,
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
