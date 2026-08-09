// lib/screens/home/home_screen.dart
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_history_item.dart';
import '../../widgets/primary_button.dart';
import '../../routes/app_routes.dart';
import '../booking/location_search_sheet.dart';
import '../booking/journey_date_time_sheet.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  // State for the search card
  String _fromLocation = '';
  String _toLocation = '';
  LatLng? _fromLatLng;
  LatLng? _toLatLng;
  
  DateTime? _journeyDate;
  TimeOfDay? _pickupTime;
  
  int _passengers = 2;
  int _luggage = 2;
  
  late final AnimationController _swapController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 300),
  );

  @override
  void dispose() {
    _swapController.dispose();
    super.dispose();
  }

  void _swapLocations(StateSetter? setSheetState) {
    if (_fromLocation.isEmpty && _toLocation.isEmpty) return;
    
    _swapController.forward(from: 0.0);
    
    final newFromLoc = _toLocation;
    final newFromLat = _toLatLng;
    final newToLoc = _fromLocation;
    final newToLat = _fromLatLng;

    setState(() {
      _fromLocation = newFromLoc;
      _fromLatLng = newFromLat;
      _toLocation = newToLoc;
      _toLatLng = newToLat;
    });
    if (setSheetState != null) {
      setSheetState(() {});
    }
  }

  void _openProfile() {
    Navigator.of(context).pushNamed(AppRoutes.profile);
  }

  void _openMyRides() {
    Navigator.of(context).pushNamed(AppRoutes.myRides);
  }

  void _searchCars() {
    if (_fromLatLng == null || _toLatLng == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select both Pickup and Drop locations.')),
      );
      return;
    }
    if (_journeyDate == null || _pickupTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select your Journey Date & Time.')),
      );
      return;
    }
    Navigator.of(context).pop(); // Close bottom sheet
    Navigator.of(context).pushNamed(
      '/search-results',
      arguments: {
        'from': _fromLocation,
        'to': _toLocation,
        'fromLatLng': _fromLatLng,
        'toLatLng': _toLatLng,
        'date': _journeyDate,
        'time': _pickupTime,
        'passengers': _passengers,
        'luggage': _luggage,
      },
    );
  }

  Future<void> _pickLocation(bool isFrom, StateSetter setSheetState) async {
    final result = await showLocationSearchSheet(
      context,
      initialQuery: isFrom ? _fromLocation : _toLocation,
      hintText: isFrom ? 'Where from?' : 'Where to?',
    );

    if (result != null) {
      setState(() {
        if (isFrom) {
          _fromLocation = result.address;
          _fromLatLng = result.latLng;
        } else {
          _toLocation = result.address;
          _toLatLng = result.latLng;
        }
      });
      setSheetState(() {});
    }
  }

  Future<void> _pickDateTime(StateSetter setSheetState) async {
    final result = await showJourneyDateTimeSheet(
      context,
      initialDate: _journeyDate,
      initialTime: _pickupTime,
    );

    if (result != null) {
      setState(() {
        _journeyDate = result.date;
        _pickupTime = result.time;
      });
      setSheetState(() {});
    }
  }

  void _showSearchBottomSheet(BuildContext context) {
    final colors = AppColors.of(context);
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      useSafeArea: true,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setSheetState) {
            final bool hasBothLocations = _fromLatLng != null && _toLatLng != null;
            
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              decoration: BoxDecoration(
                color: colors.background,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SafeArea(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Handle bar
                      Center(
                        child: Container(
                          width: 40,
                          height: 5,
                          decoration: BoxDecoration(
                            color: colors.divider,
                            borderRadius: BorderRadius.circular(2.5),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text('Plan your journey', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
                      const SizedBox(height: 24),
                      
                      // Location Fields Container
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: colors.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: colors.inputBorder),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Column(
                              children: [
                                const Icon(Icons.circle, size: 12, color: AppColors.primaryGold),
                                Container(width: 2, height: 40, color: colors.divider),
                                Icon(Icons.location_on, size: 16, color: colors.accentIcon),
                              ],
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                children: [
                                  // FROM FIELD
                                  GestureDetector(
                                    onTap: () => _pickLocation(true, setSheetState),
                                    child: Container(
                                      color: Colors.transparent, // expand tap area
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              _fromLocation.isEmpty ? 'Where from?' : _fromLocation,
                                              style: _fromLocation.isEmpty
                                                  ? AppTextStyles.body.copyWith(color: colors.textSecondary)
                                                  : AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Divider(height: 16, color: colors.divider),
                                  // TO FIELD
                                  GestureDetector(
                                    onTap: () => _pickLocation(false, setSheetState),
                                    child: Container(
                                      color: Colors.transparent,
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              _toLocation.isEmpty ? 'Where to?' : _toLocation,
                                              style: _toLocation.isEmpty
                                                  ? AppTextStyles.body.copyWith(color: colors.textSecondary)
                                                  : AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            // SWAP BUTTON
                            GestureDetector(
                              onTap: () => _swapLocations(setSheetState),
                              child: AnimatedBuilder(
                                animation: _swapController,
                                builder: (context, child) {
                                  return Transform.rotate(
                                    angle: _swapController.value * math.pi,
                                    child: Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: colors.background,
                                        shape: BoxShape.circle,
                                        border: Border.all(color: colors.divider),
                                      ),
                                      child: Icon(Icons.swap_vert, color: colors.textSecondary, size: 20),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      if (hasBothLocations) ...[
                        const SizedBox(height: 24),
                        _buildMapPreview(colors),
                      ],
                      
                      const SizedBox(height: 24),
                      // Journey Date & Time Button
                      GestureDetector(
                        onTap: () => _pickDateTime(setSheetState),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: colors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: colors.inputBorder),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.calendar_month, color: colors.accentIcon, size: 20),
                                  const SizedBox(width: 12),
                                  Text(
                                    _journeyDate == null
                                        ? 'Select Date & Time'
                                        : '${_journeyDate!.day} ${_getMonthName(_journeyDate!.month)} ${_journeyDate!.year} • ${_pickupTime!.format(context)}',
                                    style: _journeyDate == null
                                        ? AppTextStyles.body.copyWith(color: colors.textSecondary)
                                        : AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                              Icon(Icons.chevron_right, color: colors.textSecondary, size: 20),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      // Trip Details: Passengers & Luggage
                      Row(
                        children: [
                          Expanded(
                            child: _buildCounter(
                              colors,
                              'Passengers',
                              _passengers,
                              (val) {
                                if (val > 0) {
                                  setSheetState(() => _passengers = val);
                                  setState(() => _passengers = val);
                                }
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildCounter(
                              colors,
                              'Luggage',
                              _luggage,
                              (val) {
                                if (val >= 0) {
                                  setSheetState(() => _luggage = val);
                                  setState(() => _luggage = val);
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                      
                      PrimaryButton(
                        label: 'Search Cars',
                        onPressed: hasBothLocations ? _searchCars : null,
                      ),
                    ],
                  ),
                ),
              ),
            );
          }
        );
      },
    );
  }

  Widget _buildMapPreview(AppColorPalette colors) {
    // A beautiful conceptual map preview (avoids heavy GoogleMap rendering inside a bottom sheet for speed).
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primaryGold.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            height: 60,
            width: 60,
            decoration: BoxDecoration(
              color: AppColors.primaryGold.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.map_outlined, color: AppColors.primaryGold, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Route Preview', style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: colors.background,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text('~520 KM', style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text('Estimated travel time: 9 hr 30 min', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildCounter(AppColorPalette colors, String label, int value, Function(int) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: colors.inputBorder),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: () => onChanged(value - 1),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(shape: BoxShape.circle, color: colors.background),
                  child: Icon(Icons.remove, size: 16, color: colors.textPrimary),
                ),
              ),
              Text('$value', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary)),
              GestureDetector(
                onTap: () => onChanged(value + 1),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(shape: BoxShape.circle, color: colors.background),
                  child: Icon(Icons.add, size: 16, color: colors.textPrimary),
                ),
              ),
            ],
          ),
        ),
      ],
    );
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
            _buildHeader(colors),
            const SizedBox(height: 32),
            _buildSearchCard(colors),
            const SizedBox(height: 40),
            _buildRecentRidesSection(colors),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(AppColorPalette colors) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Good Morning, Himanshu 👋', style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
              const SizedBox(height: 8),
              Text(
                'Where are you travelling today?',
                style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: _openProfile,
          child: Container(
            height: 48,
            width: 48,
            decoration: BoxDecoration(
              color: colors.surface,
              shape: BoxShape.circle,
              border: Border.all(color: colors.inputBorder),
            ),
            child: ClipOval(
              child: Image.asset(
                'assets/images/logo.jpeg',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Icon(Icons.person, color: colors.textPrimary),
              ),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildSearchCard(AppColorPalette colors) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 24,
            offset: const Offset(0, 12),
          )
        ],
        border: Border.all(color: colors.inputBorder.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // FROM
          GestureDetector(
            onTap: () => _showSearchBottomSheet(context),
            behavior: HitTestBehavior.opaque,
            child: Row(
              children: [
                const Icon(Icons.location_on, color: AppColors.primaryGold, size: 24),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('FROM', style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                      const SizedBox(height: 4),
                      Text(
                        _fromLocation.isEmpty ? 'Search location' : _fromLocation,
                        style: _fromLocation.isEmpty
                            ? AppTextStyles.subtitle.copyWith(color: colors.textSecondary)
                            : AppTextStyles.subtitle.copyWith(color: colors.textPrimary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Swap and Divider
          Padding(
            padding: const EdgeInsets.only(left: 11, top: 8, bottom: 8),
            child: Row(
              children: [
                Container(
                  height: 40,
                  width: 2,
                  color: colors.divider,
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () => _swapLocations(null),
                  child: AnimatedBuilder(
                    animation: _swapController,
                    builder: (context, child) {
                      return Transform.rotate(
                        angle: _swapController.value * math.pi,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: colors.surfaceElevated,
                            shape: BoxShape.circle,
                            border: Border.all(color: colors.divider),
                          ),
                          child: Icon(Icons.swap_vert, color: colors.accentIcon, size: 20),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          
          // TO
          GestureDetector(
            onTap: () => _showSearchBottomSheet(context),
            behavior: HitTestBehavior.opaque,
            child: Row(
              children: [
                const Icon(Icons.location_on, color: AppColors.primaryGold, size: 24),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('TO', style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                      const SizedBox(height: 4),
                      Text(
                        _toLocation.isEmpty ? 'Search destination' : _toLocation,
                        style: _toLocation.isEmpty
                            ? AppTextStyles.subtitle.copyWith(color: colors.textSecondary)
                            : AppTextStyles.subtitle.copyWith(color: colors.textPrimary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          Container(height: 1, width: double.infinity, color: colors.divider),
          const SizedBox(height: 24),
          
          // Details (Date & Time)
          GestureDetector(
            onTap: () => _showSearchBottomSheet(context),
            behavior: HitTestBehavior.opaque,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.calendar_month, size: 20, color: _journeyDate != null ? AppColors.primaryGold : colors.textSecondary),
                    const SizedBox(width: 8),
                    Text(
                      _journeyDate == null ? 'Journey Date' : '${_journeyDate!.day} ${_getMonthName(_journeyDate!.month)}',
                      style: AppTextStyles.body.copyWith(
                        color: _journeyDate != null ? colors.textPrimary : colors.textSecondary,
                        fontWeight: _journeyDate != null ? FontWeight.w600 : FontWeight.w400,
                      )
                    ),
                  ],
                ),
                Row(
                  children: [
                    Icon(Icons.schedule, size: 20, color: _pickupTime != null ? AppColors.primaryGold : colors.textSecondary),
                    const SizedBox(width: 8),
                    Text(
                      _pickupTime == null ? 'Time' : _pickupTime!.format(context),
                      style: AppTextStyles.body.copyWith(
                        color: _pickupTime != null ? colors.textPrimary : colors.textSecondary,
                        fontWeight: _pickupTime != null ? FontWeight.w600 : FontWeight.w400,
                      )
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Details (Passengers)
          GestureDetector(
            onTap: () => _showSearchBottomSheet(context),
            behavior: HitTestBehavior.opaque,
            child: Row(
              children: [
                Icon(Icons.person, size: 20, color: colors.textSecondary),
                const SizedBox(width: 8),
                Text('$_passengers People', style: AppTextStyles.body.copyWith(color: colors.textSecondary)),
                const SizedBox(width: 24),
                Icon(Icons.luggage, size: 20, color: colors.textSecondary),
                const SizedBox(width: 8),
                Text('$_luggage Bags', style: AppTextStyles.body.copyWith(color: colors.textSecondary)),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          
          PrimaryButton(
            label: 'SEARCH CARS →',
            onPressed: () {
              if (_fromLatLng == null || _toLatLng == null) {
                _showSearchBottomSheet(context);
              } else {
                _searchCars();
              }
            },
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms, duration: 400.ms).slideY(begin: 0.1, end: 0, duration: 400.ms);
  }

  Widget _buildRecentRidesSection(AppColorPalette colors) {
    const mockRecentRides = [
      RideHistoryItem(
        id: 'recent_1',
        fromAddress: 'Ahmedabad',
        toAddress: 'Surat',
        dateLabel: 'Yesterday, 6:42 PM',
        fare: '₹2,500',
        status: RideStatus.completed,
        vehicleLabel: 'Sedan',
      ),
      RideHistoryItem(
        id: 'recent_2',
        fromAddress: 'Mumbai',
        toAddress: 'Pune',
        dateLabel: 'Mon, 1:15 PM',
        fare: '₹1,800',
        status: RideStatus.completed,
        vehicleLabel: 'Sedan',
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Recent Searches', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
            GestureDetector(
              onTap: _openMyRides,
              child: Text('View all', style: AppTextStyles.link),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...mockRecentRides.map(
          (ride) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _RecentRideTile(
              ride: ride,
              onTap: () {
                setState(() {
                  _fromLocation = ride.fromAddress;
                  _toLocation = ride.toAddress;
                  // Note: Mock recent searches don't have LatLngs, so in a real scenario
                  // we'd also hydrate their coordinates here. For this demo, we'll
                  // just set dummy coordinates so the flow can proceed.
                  _fromLatLng = const LatLng(23.0225, 72.5714); 
                  _toLatLng = const LatLng(19.0760, 72.8777);
                });
                _showSearchBottomSheet(context);
              },
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  String _getMonthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
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
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                height: 48,
                width: 48,
                decoration: BoxDecoration(
                  color: colors.background,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: colors.divider),
                ),
                child: Icon(
                  Icons.history,
                  color: colors.accentIcon,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${ride.fromAddress}  →  ${ride.toAddress}',
                      style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text('Sedan • AC', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: colors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}