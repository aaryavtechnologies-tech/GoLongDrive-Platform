// lib/screens/rides/ride_details_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_history_item.dart';

import '../../widgets/primary_button.dart';

import '../../routes/app_routes.dart';

class RideDetailsScreen extends StatelessWidget {
  final RideHistoryItem ride;

  const RideDetailsScreen({super.key, required this.ride});

  void _callDriver(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Calling Driver...')),
    );
  }

  void _messageDriver(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Opening Messages...')),
    );
  }

  void _viewBoardingPass(BuildContext context) {
    Navigator.of(context).pushNamed(
      AppRoutes.boardingPass,
      arguments: {
        'bookingId': ride.id,
        'from': ride.fromAddress.split(',').first,
        'to': ride.toAddress.split(',').first,
        'date': ride.dateLabel,
        'time': '08:30 AM', // Mock data
        'car': {
          'model': ride.carName ?? ride.vehicleLabel,
          'distance': ride.distanceKm != null ? '${ride.distanceKm!.toStringAsFixed(0)} KM' : 'N/A'
        },
        'passengers': 2,
        'luggage': 2,
        'advancePaid': 500,
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    
    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.background,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: colors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text('Booking Details', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  _buildTripInfo(colors),
                  const SizedBox(height: 24),
                  _buildVehicleInfo(colors),
                  const SizedBox(height: 24),
                  if (ride.hasFareBreakdown) ...[
                    _buildPriceInfo(colors),
                    const SizedBox(height: 24),
                  ],
                  _buildDriverInfo(colors, context),
                ],
              ),
            ),
            // Actions
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border(top: BorderSide(color: colors.divider)),
              ),
              child: PrimaryButton(
                label: 'View Boarding Pass',
                onPressed: () => _viewBoardingPass(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTripInfo(AppColorPalette colors) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.inputBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Trip Information', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('FROM', style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                    const SizedBox(height: 4),
                    Text(ride.fromAddress, style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward, color: colors.textSecondary, size: 20),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('TO', style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                    const SizedBox(height: 4),
                    Text(ride.toAddress, style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildDetailItem(colors, 'Date', ride.dateLabel)),
              Expanded(child: _buildDetailItem(colors, 'Time', '08:30 AM')), // Mock time
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildDetailItem(colors, 'Distance', ride.distanceKm != null ? '${ride.distanceKm!.toStringAsFixed(0)} KM' : 'N/A')),
              Expanded(child: _buildDetailItem(colors, 'Duration', '10h 30m')), // Mock duration
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildVehicleInfo(AppColorPalette colors) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.inputBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Vehicle Information', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                height: 60,
                width: 80,
                decoration: BoxDecoration(
                  color: colors.surfaceElevated,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: colors.divider),
                ),
                child: Icon(Icons.directions_car, color: colors.accentIcon, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(ride.carName ?? ride.vehicleLabel, style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(ride.vehicleLabel, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGold.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppColors.primaryGold),
                      ),
                      child: Text(ride.plateNumber ?? 'GJ01AB1234', style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildDetailItem(colors, 'Capacity', '4 Seats')),
              Expanded(child: _buildDetailItem(colors, 'Luggage', '2 Bags')),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms, duration: 400.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildPriceInfo(AppColorPalette colors) {
    if (!ride.hasFareBreakdown) {
      return const SizedBox.shrink();
    }
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.inputBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Price Breakdown', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Base Fare', style: AppTextStyles.body.copyWith(color: colors.textSecondary)),
              Text('₹${ride.baseFare!.toStringAsFixed(0)}', style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Distance Charge', style: AppTextStyles.body.copyWith(color: colors.textSecondary)),
              Text('₹${ride.distanceCharge!.toStringAsFixed(0)}', style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Fare', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
              Text('₹${ride.totalFareAmount.toStringAsFixed(0)}', style: AppTextStyles.subtitle.copyWith(color: AppColors.primaryGold)),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: 150.ms, duration: 400.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildDriverInfo(AppColorPalette colors, BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.inputBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Driver Information', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
              if (ride.status != RideStatus.cancelled)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text('Assigned', style: AppTextStyles.caption.copyWith(color: AppColors.success, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                height: 56,
                width: 56,
                decoration: BoxDecoration(
                  color: colors.surfaceElevated,
                  shape: BoxShape.circle,
                  border: Border.all(color: colors.divider),
                ),
                child: Icon(Icons.person, color: colors.textSecondary, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(ride.driverName ?? 'Rajesh Kumar', style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.star, color: AppColors.success, size: 14),
                        const SizedBox(width: 4),
                        Text('${ride.driverRating ?? "4.8"}', style: AppTextStyles.caption.copyWith(color: AppColors.success, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 12),
                        Icon(Icons.phone, color: colors.textSecondary, size: 14),
                        const SizedBox(width: 4),
                        Text('+91 98765 43210', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _callDriver(context),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    side: BorderSide(color: colors.inputBorder),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.call, size: 18, color: colors.textPrimary),
                      const SizedBox(width: 8),
                      Text('Call', style: AppTextStyles.button.copyWith(color: colors.textPrimary)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _messageDriver(context),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    side: BorderSide(color: colors.inputBorder),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.message, size: 18, color: colors.textPrimary),
                      const SizedBox(width: 8),
                      Text('Message', style: AppTextStyles.button.copyWith(color: colors.textPrimary)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 400.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildDetailItem(AppColorPalette colors, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
        const SizedBox(height: 4),
        Text(value, style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
