// lib/screens/rides/ride_details_screen.dart
//
// Reached by tapping a row on Ride History OR the "Past" tab of My Rides —
// both push here with the same `RideHistoryItem`, so this is the single
// detail screen for any past ride regardless of where the tap happened.
//
// ============================================================================
// BACKEND HOOKUP
// ============================================================================
// - This screen is purely a renderer for whatever `RideHistoryItem` it's
//   given — it does NOT fetch anything itself. If the list screens start
//   passing a lightweight row-only object (id + a few fields) instead of
//   the full record, this screen will need to fetch the full ride by
//   `ride.id` (e.g. `GET /api/rides/history/{id}`) on `initState` instead.
//   Simplest path: keep having the list endpoint return full objects (see
//   models/ride_history_item.dart) so no extra fetch is needed here.
// - "Download receipt" -> wire to a real receipt endpoint (PDF/HTML) once
//   it exists; currently a "coming soon" SnackBar, same placeholder pattern
//   used elsewhere in this app (Help & Support's Chat/Call/Email, etc).
// - "Report an issue" -> should push the same issue-report flow referenced
//   in help_support_screen.dart's TODO — that flow doesn't exist yet
//   either, so both screens are currently pointing at the same gap.
// - Every section (fare breakdown, driver card, cancellation note) only
//   renders if its underlying fields are non-null on the `RideHistoryItem`
//   — see `RideHistoryItem.hasFareBreakdown`. A real backend response
//   should always populate these for a genuine past ride, but this keeps
//   the screen safe against partial/legacy data instead of crashing.
// ============================================================================
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_history_item.dart';
import '../../widgets/back_button.dart';
import '../../widgets/secondary_button.dart';

class RideDetailsScreen extends StatelessWidget {
  final RideHistoryItem ride;

  const RideDetailsScreen({super.key, required this.ride});

  void _downloadReceipt(BuildContext context) {
    // TODO(backend): fetch/generate a real receipt (PDF or HTML) for
    // ride.id and open/share it. Placeholder for now — see file header.
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Download receipt — coming soon')),
    );
  }

  void _reportIssue(BuildContext context) {
    // TODO(backend/nav): route to a real issue-report flow, same gap
    // flagged in help_support_screen.dart. Placeholder for now.
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Report an issue — coming soon')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final isCancelled = ride.status == RideStatus.cancelled;

    return Scaffold(
      backgroundColor: colors.background,
      // SafeArea + single scroll view: this screen can have a lot of
      // sections (route, trip meta, fare breakdown, driver, actions) so it
      // must scroll cleanly on short phones without any fixed-height traps.
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTopBar(context),
              const SizedBox(height: 20),
              _StatusBanner(ride: ride).animate().fadeIn(duration: 250.ms),
              const SizedBox(height: 16),
              _RouteCard(ride: ride)
                  .animate()
                  .fadeIn(delay: 60.ms, duration: 250.ms),
              const SizedBox(height: 16),
              _TripMetaCard(ride: ride)
                  .animate()
                  .fadeIn(delay: 100.ms, duration: 250.ms),
              if (ride.hasFareBreakdown) ...[
                const SizedBox(height: 16),
                _FareBreakdownCard(ride: ride)
                    .animate()
                    .fadeIn(delay: 140.ms, duration: 250.ms),
              ] else ...[
                const SizedBox(height: 16),
                _FlatFareCard(ride: ride)
                    .animate()
                    .fadeIn(delay: 140.ms, duration: 250.ms),
              ],
              if (!isCancelled && ride.driverName != null) ...[
                const SizedBox(height: 16),
                _DriverCard(ride: ride)
                    .animate()
                    .fadeIn(delay: 180.ms, duration: 250.ms),
              ],
              if (isCancelled && ride.cancellationReason != null) ...[
                const SizedBox(height: 16),
                _CancellationNote(reason: ride.cancellationReason!)
                    .animate()
                    .fadeIn(delay: 180.ms, duration: 250.ms),
              ],
              const SizedBox(height: 28),
              Row(
                children: [
                  Expanded(
                    child: SecondaryButton(
                      label: 'Report an issue',
                      onPressed: () => _reportIssue(context),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SecondaryButton(
                      label: 'Download receipt',
                      onPressed: () => _downloadReceipt(context),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      children: [
        AppBackButton(onPressed: () => Navigator.of(context).pop()),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            'Ride Details',
            style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

/// Top-of-screen status pill — mirrors the color language already used for
/// `RideStatus` on the list rows (green for completed, red for cancelled)
/// so the two screens read as one consistent system.
class _StatusBanner extends StatelessWidget {
  final RideHistoryItem ride;
  const _StatusBanner({required this.ride});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final color = ride.status.color;
    final icon = ride.status == RideStatus.completed
        ? Icons.check_circle
        : Icons.cancel_outlined;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '${ride.status.label} · ${ride.dateLabel}',
              style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

/// Pickup -> drop addresses, same visual pattern (dot/line/square) used
/// across the booking flow (Confirm Ride, Driver Assigned, Trip Details) so
/// a rider recognizes it instantly.
class _RouteCard extends StatelessWidget {
  final RideHistoryItem ride;
  const _RouteCard({required this.ride});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.divider),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              const Icon(Icons.circle, size: 10, color: AppColors.primaryGold),
              Container(width: 1.5, height: 30, color: colors.divider),
              Icon(Icons.square, size: 10, color: colors.textSecondary),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(ride.fromAddress, style: AppTextStyles.body.copyWith(color: colors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 14),
                Text(ride.toAddress, style: AppTextStyles.body.copyWith(color: colors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Trip-level facts: car, dates, day count, distance. Uses a `Wrap` (not a
/// fixed `Row`) so long values or narrow phones never cause an overflow —
/// chips simply wrap to the next line instead.
class _TripMetaCard extends StatelessWidget {
  final RideHistoryItem ride;
  const _TripMetaCard({required this.ride});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final chips = <Widget>[
      _MetaChip(icon: Icons.directions_car_filled_outlined, label: ride.carName ?? ride.vehicleLabel),
      if (ride.startDate != null) _MetaChip(icon: Icons.event_available_rounded, label: ride.startDate!),
      if (ride.numberOfDays != null)
        _MetaChip(icon: Icons.calendar_month_rounded, label: '${ride.numberOfDays} day${ride.numberOfDays == 1 ? '' : 's'}'),
      if (ride.distanceKm != null) _MetaChip(icon: Icons.route, label: '${ride.distanceKm!.toStringAsFixed(0)} km'),
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.divider),
      ),
      child: Wrap(
        spacing: 18,
        runSpacing: 12,
        children: chips,
      ),
    );
  }
}

extension _RideDateRangeLabel on RideHistoryItem {
  // Small private-ish helper kept in this file: prefers the full date
  // range if both are present, otherwise falls back to just the start
  // date. Kept here (not in the model) since it's purely a display
  // decision for this one screen.
  String? get startDate {
    if (startDateLabel == null) return null;
    if (returnDateLabel == null || returnDateLabel == startDateLabel) return startDateLabel;
    return '$startDateLabel → $returnDateLabel';
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _MetaChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: colors.accentIcon),
        const SizedBox(width: 6),
        Text(label, style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
      ],
    );
  }
}

/// Full fare breakdown for rides that have day/km rate data — shows the
/// same (day cost) + (km cost) = total formula used throughout the booking
/// flow, so the receipt makes sense next to what the rider saw when
/// booking.
class _FareBreakdownCard extends StatelessWidget {
  final RideHistoryItem ride;
  const _FareBreakdownCard({required this.ride});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Fare breakdown', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary)),
          const SizedBox(height: 14),
          _FareRow(
            label: '₹${ride.perDayRate!.toStringAsFixed(0)}/day × ${ride.numberOfDays} day${ride.numberOfDays == 1 ? '' : 's'}',
            amount: ride.dayCost,
          ),
          const SizedBox(height: 10),
          _FareRow(
            label: '₹${ride.perKmRate!.toStringAsFixed(0)}/km × ${ride.distanceKm!.toStringAsFixed(0)} km',
            amount: ride.kmCost,
          ),
          const SizedBox(height: 12),
          Divider(color: colors.divider, height: 1),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total paid', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700, color: colors.textPrimary)),
              Text(ride.fare, style: AppTextStyles.mediumHeading.copyWith(fontSize: 20, color: colors.textPrimary)),
            ],
          ),
          if (ride.paymentLabel != null) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(Icons.account_balance_wallet_outlined, size: 15, color: colors.textSecondary),
                const SizedBox(width: 6),
                Text('Paid via ${ride.paymentLabel}', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _FareRow extends StatelessWidget {
  final String label;
  final double amount;
  const _FareRow({required this.label, required this.amount});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(label, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary), overflow: TextOverflow.ellipsis),
        ),
        const SizedBox(width: 8),
        Text('₹${amount.toStringAsFixed(0)}', style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
      ],
    );
  }
}

/// Fallback for rides without full breakdown data (e.g. a cancelled ride
/// with ₹0 fare, or legacy/partial records) — just shows the flat total
/// instead of a formula that has nothing to break down.
class _FlatFareCard extends StatelessWidget {
  final RideHistoryItem ride;
  const _FlatFareCard({required this.ride});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.divider),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            ride.status == RideStatus.cancelled ? 'Amount charged' : 'Total paid',
            style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700, color: colors.textPrimary),
          ),
          Text(ride.fare, style: AppTextStyles.mediumHeading.copyWith(fontSize: 20, color: colors.textPrimary)),
        ],
      ),
    );
  }
}

/// Driver who completed the ride — visually echoes the assigned-driver row
/// on `DriverAssignedScreen` (avatar circle, name, rating, vehicle+plate)
/// for consistency, minus the live actions (call/cancel) since this ride is
/// already over.
class _DriverCard extends StatelessWidget {
  final RideHistoryItem ride;
  const _DriverCard({required this.ride});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.divider),
      ),
      child: Row(
        children: [
          Container(
            height: 48,
            width: 48,
            decoration: BoxDecoration(color: colors.background, shape: BoxShape.circle),
            child: const Icon(Icons.person, color: AppColors.primaryGold, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  ride.driverName!,
                  style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    if (ride.driverRating != null) ...[
                      const Icon(Icons.star, color: AppColors.primaryGold, size: 13),
                      const SizedBox(width: 4),
                      Text(ride.driverRating!.toStringAsFixed(1), style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                      const SizedBox(width: 8),
                    ],
                    if (ride.plateNumber != null)
                      Flexible(
                        child: Text(
                          ride.plateNumber!,
                          style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Shown only for cancelled rides that have a recorded reason — keeps the
/// screen honest about why no driver/fare-breakdown card is shown for that
/// case.
class _CancellationNote extends StatelessWidget {
  final String reason;
  const _CancellationNote({required this.reason});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.error.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.error.withOpacity(0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline, color: AppColors.error, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(reason, style: AppTextStyles.bodySecondary.copyWith(color: colors.textPrimary)),
          ),
        ],
      ),
    );
  }
}
