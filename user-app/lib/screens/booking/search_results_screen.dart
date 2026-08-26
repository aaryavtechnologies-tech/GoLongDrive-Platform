// lib/screens/booking/search_results_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../widgets/primary_button.dart';
import '../../core/services/booking_service.dart';

class SearchResultsScreen extends StatefulWidget {
  final Map<String, dynamic> searchArgs;

  const SearchResultsScreen({super.key, required this.searchArgs});

  @override
  State<SearchResultsScreen> createState() => _SearchResultsScreenState();
}

class _SearchResultsScreenState extends State<SearchResultsScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _vehicles = [];
  Map<String, dynamic>? _distanceData;

  @override
  void initState() {
    super.initState();
    _fetchVehicles();
  }

  Future<void> _fetchVehicles() async {
    try {
      final from = widget.searchArgs['from'] ?? 'Ahmedabad';
      final to = widget.searchArgs['to'] ?? 'Mumbai';
      final DateTime? date = widget.searchArgs['date'];
      final TimeOfDay? time = widget.searchArgs['time'];

      final dateString = date != null ? '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}' : '';
      final timeString = time != null ? '${time.hour}:${time.minute}' : '';

      final data = await BookingService.searchVehicles(
        from: from,
        to: to,
        date: dateString,
        time: timeString,
      );

      setState(() {
        _vehicles = data['vehicles'];
        _distanceData = data['distance'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _selectCar(BuildContext context, Map<String, dynamic> carDetails) {
    Navigator.of(context).pushNamed(
      '/confirm-ride',
      arguments: {
        ...widget.searchArgs,
        'car': carDetails,
        if (_distanceData != null) 'distance': _distanceData,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final String from = widget.searchArgs['from'] ?? 'Ahmedabad';
    final String to = widget.searchArgs['to'] ?? 'Mumbai';
    final DateTime? date = widget.searchArgs['date'];
    final TimeOfDay? time = widget.searchArgs['time'];

    final String dateString = date != null ? '${date.day} ${_getMonthName(date.month)} ${date.year}' : '15 Aug 2026';
    final String timeString = time != null ? time.format(context) : '08:30 AM';

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.background,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: colors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text('Select Ride', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
        centerTitle: true,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Route Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: BoxDecoration(
              color: colors.background,
              border: Border(bottom: BorderSide(color: colors.divider)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    from,
                    style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary, fontSize: 18),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Icon(Icons.arrow_forward, color: colors.textSecondary, size: 20),
                ),
                Expanded(
                  child: Text(
                    to,
                    style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary, fontSize: 18),
                    textAlign: TextAlign.end,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          // Date & Time Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: colors.surface,
              border: Border(bottom: BorderSide(color: colors.divider)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.calendar_today_outlined, size: 16, color: colors.textSecondary),
                const SizedBox(width: 8),
                Text('$dateString • $timeString', style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGold))
                : _error != null
                    ? Center(child: Padding(padding: const EdgeInsets.all(24.0), child: Text(_error!, style: TextStyle(color: Colors.red), textAlign: TextAlign.center)))
                    : _vehicles.isEmpty
                        ? Center(child: Text('No vehicles available for this route.', style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)))
                        : ListView.builder(
                            padding: const EdgeInsets.all(24),
                            itemCount: _vehicles.length,
                            itemBuilder: (context, index) {
                              final car = _vehicles[index];
                              // Map API response to UI expected format
                              final mappedCar = {
                                'model': car['name'],
                                'category': car['category'],
                                'seats': car['seatingCapacity'] ?? 4,
                                'luggage': car['luggageCapacity'] ?? 2,
                                'ac': true,
                                'rating': '4.8', // Mock rating
                                'time': car['durationText'] ?? 'N/A',
                                'distance': car['distanceText'] ?? 'N/A',
                                'total': car['fare'],
                                'advanceAmount': car['advanceAmount'] ?? 500,
                              };
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 20),
                                child: _buildCarCard(context, colors, mappedCar, from, to, dateString, timeString),
                              ).animate().fadeIn(duration: 400.ms, delay: 100.ms).slideY(begin: 0.1, end: 0, duration: 400.ms);
                            },
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildCarCard(BuildContext context, AppColorPalette colors, Map<String, dynamic> car, String from, String to, String dateString, String timeString) {
    return Container(
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 15,
            offset: const Offset(0, 8),
          )
        ],
        border: Border.all(color: colors.inputBorder.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top section: Car Info
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 60,
                  width: 80,
                  decoration: BoxDecoration(
                    color: colors.surfaceElevated,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.directions_car, size: 40, color: colors.accentIcon),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(car['model'], style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text('${car['category']} • ${car['ac'] ? 'AC' : 'Non-AC'} • ${car['seats']} Seats', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.star, size: 12, color: AppColors.success),
                      const SizedBox(width: 4),
                      Text(car['rating'], style: AppTextStyles.caption.copyWith(color: AppColors.success, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          Container(height: 1, color: colors.divider),
          
          // Route and Journey
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.swap_horiz, size: 16, color: colors.textSecondary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text('$from → $to', style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w500)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.schedule, size: 16, color: colors.textSecondary),
                    const SizedBox(width: 8),
                    Text('$dateString • $timeString', style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.map_outlined, size: 16, color: colors.textSecondary),
                    const SizedBox(width: 8),
                    Text('${car['distance']} • ~${car['time']}', style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
                  ],
                ),
              ],
            ),
          ),
          
          Container(height: 1, color: colors.divider),
          
          // Bottom section: Price & CTA
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('₹${car['total']}', style: AppTextStyles.priceLarge),
                    const SizedBox(height: 4),
                    Text('₹${car['advanceAmount']} advance', style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold)),
                  ],
                ),
                SizedBox(
                  width: 140,
                  child: PrimaryButton(
                    label: 'SELECT CAR →',
                    onPressed: () => _selectCar(context, car),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getMonthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }
}
