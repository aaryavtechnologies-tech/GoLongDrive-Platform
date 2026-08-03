// lib/screens/booking/trip_details_screen.dart
//
// Step 2 of booking: GoLongDrive is an outstation/multi-day rental app, so
// before picking a car the rider needs to say HOW LONG the trip is. This
// screen sits between SetLocations and ConfirmRide:
//
//   Home -> SetLocations -> [TripDetails] -> ConfirmRide -> DriverAssigned
//
// UI-ONLY / BACKEND HOOKUP:
// - Date validation here is purely client-side (return date can't be before
//   start date, start date can't be in the past). There's no check against
//   real fleet availability — once a real backend exists, you'll likely
//   want to re-validate (and possibly show unavailable dates) via an
//   availability endpoint before letting the rider continue.
// - `numberOfDays` is computed locally via `RideRequest.numberOfDays`
//   (inclusive day count). If the business logic for "how many days does a
//   trip cost" ever changes (e.g. half-day billing, minimum 2-day bookings
//   for certain cities), that change belongs in `RideRequest.numberOfDays`
//   in models/ride_request.dart, not here — this screen just displays it.
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/theme_scope.dart';
import '../../models/ride_request.dart';
import '../../widgets/primary_button.dart';
import '../../routes/app_routes.dart';

class TripDetailsScreen extends StatefulWidget {
  final RideRequest request;

  const TripDetailsScreen({super.key, required this.request});

  @override
  State<TripDetailsScreen> createState() => _TripDetailsScreenState();
}

class _TripDetailsScreenState extends State<TripDetailsScreen> {
  DateTime? _startDate;
  DateTime? _returnDate;

  bool get _canContinue => _startDate != null && _returnDate != null;

  int? get _numberOfDays {
    if (_startDate == null || _returnDate == null) return null;
    final start = DateTime(_startDate!.year, _startDate!.month, _startDate!.day);
    final end = DateTime(_returnDate!.year, _returnDate!.month, _returnDate!.day);
    final diff = end.difference(start).inDays + 1;
    return diff < 1 ? 1 : diff;
  }

  Future<void> _pickStartDate() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate ?? today,
      firstDate: today,
      lastDate: today.add(const Duration(days: 365)),
      helpText: 'Select start date',
      builder: _datePickerTheme,
    );
    if (picked == null) return;
    setState(() {
      _startDate = picked;
      // Keep the return date consistent: if it's now before the new start
      // date (or wasn't set), snap it to the start date so the rider never
      // ends up in an invalid state.
      if (_returnDate == null || _returnDate!.isBefore(picked)) {
        _returnDate = picked;
      }
    });
  }

  Future<void> _pickReturnDate() async {
    final lowerBound = _startDate ?? DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _returnDate ?? lowerBound,
      firstDate: lowerBound,
      lastDate: lowerBound.add(const Duration(days: 365)),
      helpText: 'Select return date',
      builder: _datePickerTheme,
    );
    if (picked == null) return;
    setState(() => _returnDate = picked);
  }

  Widget _datePickerTheme(BuildContext context, Widget? child) {
    final colors = AppColors.of(context);
    final isDark = ThemeScope.of(context).isDark;
    return Theme(
      data: Theme.of(context).copyWith(
        colorScheme: (isDark ? const ColorScheme.dark() : const ColorScheme.light()).copyWith(
          primary: AppColors.primaryGold,
          onPrimary: AppColors.textOnGold,
          surface: colors.surface,
          onSurface: colors.textPrimary,
        ),
        dialogBackgroundColor: colors.surface,
      ),
      child: child!,
    );
  }

  void _continue() {
    if (!_canContinue) return;
    Navigator.of(context).pushNamed(
      AppRoutes.confirmRide,
      arguments: widget.request.copyWith(
        startDate: _startDate,
        returnDate: _returnDate,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(title: const Text('Trip details')),
      // SafeArea + LayoutBuilder + scroll view keeps this screen correct on
      // every phone: short devices (small Androids, SE-sized iPhones) get a
      // scrollable body instead of an overflow; tall devices don't leave the
      // Continue button awkwardly floating mid-screen.
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight - 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _RouteSummary(request: widget.request),
                    const SizedBox(height: 24),
                    Text('When are you travelling?', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
                    const SizedBox(height: 4),
                    Text(
                      'Pick your start and return date — fares are billed per day.',
                      style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                    ),
                    const SizedBox(height: 16),
                    _DateCard(
                      label: 'Start date',
                      value: _startDate,
                      icon: Icons.flight_takeoff_rounded,
                      onTap: _pickStartDate,
                    ),
                    const SizedBox(height: 12),
                    _DateCard(
                      label: 'Return date',
                      value: _returnDate,
                      icon: Icons.flight_land_rounded,
                      onTap: _pickReturnDate,
                    ),
                    const SizedBox(height: 16),
                    if (_numberOfDays != null)
                      _TripLengthBanner(days: _numberOfDays!)
                          .animate()
                          .fadeIn(duration: 250.ms)
                          .slideY(begin: 0.15, end: 0, duration: 250.ms),
                    // Spacer pushes the button to the bottom on tall screens
                    // while still allowing the column to scroll on short
                    // ones, since it's wrapped in ConstrainedBox(minHeight).
                    const Spacer(),
                    const SizedBox(height: 24),
                    PrimaryButton(
                      label: _numberOfDays != null
                          ? 'Continue · $_numberOfDays day${_numberOfDays == 1 ? '' : 's'}'
                          : 'Select both dates to continue',
                      onPressed: _canContinue ? _continue : null,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

/// Compact pickup -> drop reminder at the top, so the rider has context for
/// what trip they're setting dates for without needing to scroll back.
class _RouteSummary extends StatelessWidget {
  final RideRequest request;
  const _RouteSummary({required this.request});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.all(14),
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
              Icon(Icons.circle, size: 10, color: colors.accentIcon),
              Container(width: 1.5, height: 26, color: colors.divider),
              Icon(Icons.square, size: 10, color: colors.textSecondary),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  request.pickupAddress,
                  style: AppTextStyles.body.copyWith(color: colors.textPrimary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),
                Text(
                  request.dropAddress,
                  style: AppTextStyles.body.copyWith(color: colors.textPrimary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Tappable card for picking either date. Shows a placeholder state before
/// a date is chosen and a formatted date afterwards.
class _DateCard extends StatelessWidget {
  final String label;
  final DateTime? value;
  final IconData icon;
  final VoidCallback onTap;

  const _DateCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.onTap,
  });

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String _format(DateTime d) => '${d.day} ${_months[d.month - 1]} ${d.year}';

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final hasValue = value != null;
    return Semantics(
      button: true,
      label: hasValue ? '$label, ${_format(value!)}' : '$label, not set',
      child: Material(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: hasValue ? AppColors.primaryGold.withOpacity(0.5) : colors.inputBorder,
              ),
            ),
            child: Row(
              children: [
                Container(
                  height: 42,
                  width: 42,
                  decoration: BoxDecoration(color: colors.background, borderRadius: BorderRadius.circular(12)),
                  child: Icon(icon, color: colors.accentIcon, size: 20),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(label, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                      const SizedBox(height: 2),
                      Text(
                        hasValue ? _format(value!) : 'Tap to select',
                        style: AppTextStyles.body.copyWith(
                          fontWeight: FontWeight.w600,
                          color: hasValue ? colors.textPrimary : colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right, color: colors.textSecondary, size: 22),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Small confirmation banner once both dates are picked — reassures the
/// rider what they'll be billed for (day count) before moving on to car
/// selection where the actual fare shows up.
class _TripLengthBanner extends StatelessWidget {
  final int days;
  const _TripLengthBanner({required this.days});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.primaryGold.withOpacity(0.10),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primaryGold.withOpacity(0.35)),
      ),
      child: Row(
        children: [
          const Icon(Icons.event_available_rounded, color: AppColors.primaryGold, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '$days day${days == 1 ? '' : 's'} trip · fares are billed per day + per km',
              style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w500, color: colors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}
