// lib/screens/rides/my_rides_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_history_item.dart';
import '../../widgets/back_button.dart';
import '../../routes/app_routes.dart';
import '../../core/services/booking_service.dart';

class MyRidesScreen extends StatefulWidget {
  const MyRidesScreen({super.key});

  @override
  State<MyRidesScreen> createState() => _MyRidesScreenState();
}

class _MyRidesScreenState extends State<MyRidesScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController = TabController(length: 3, vsync: this);
  bool _isLoading = true;

  List<Map<String, dynamic>> _mockUpcoming = [];
  List<RideHistoryItem> _mockCompleted = [];
  List<RideHistoryItem> _mockCancelled = [];

  @override
  void initState() {
    super.initState();
    _fetchBookings();
  }

  Future<void> _fetchBookings() async {
    try {
      final data = await BookingService.getMyBookings();
      
      final upcoming = <Map<String, dynamic>>[];
      final completed = <RideHistoryItem>[];
      final cancelled = <RideHistoryItem>[];

      for (var booking in data) {
        final status = booking['status'] ?? 'Pending';
        final isUpcoming = ['Pending', 'Confirmed', 'Searching Driver', 'Driver Assigned'].contains(status);
        final isCancelled = ['Cancelled by Customer', 'Cancelled by Driver', 'Cancelled by Admin'].contains(status);

        final fromAddress = booking['pickupLocation']?['address'] ?? 'Unknown';
        final toAddress = booking['dropLocation']?['address'] ?? 'Unknown';
        final dateStr = booking['pickupDate'] ?? '';
        final timeStr = booking['pickupTime'] ?? '';

        if (isUpcoming) {
          upcoming.add({
            'id': booking['_id'],
            'from': fromAddress,
            'to': toAddress,
            'date': dateStr,
            'time': timeStr,
            'car': booking['vehicleType'] ?? 'Car',
            'carNo': 'Pending',
            'total': '₹${booking['fareAmount'] ?? 0}',
            'advance': '₹${booking['advancePaid'] ?? 0}',
            'status': status.toUpperCase(),
          });
        } else if (isCancelled) {
          cancelled.add(RideHistoryItem(
            id: booking['_id'] ?? '',
            fromAddress: fromAddress,
            toAddress: toAddress,
            dateLabel: dateStr,
            fare: '₹${booking['fareAmount'] ?? 0}',
            status: RideStatus.cancelled,
            vehicleLabel: booking['vehicleType'] ?? 'Car',
            carName: booking['vehicleType'] ?? 'Car',
            cancellationReason: 'Cancelled',
          ));
        } else {
          completed.add(RideHistoryItem(
            id: booking['_id'] ?? '',
            fromAddress: fromAddress,
            toAddress: toAddress,
            dateLabel: dateStr,
            fare: '₹${booking['fareAmount'] ?? 0}',
            status: RideStatus.completed,
            vehicleLabel: booking['vehicleType'] ?? 'Car',
            carName: booking['vehicleType'] ?? 'Car',
          ));
        }
      }

      if (!mounted) return;
      setState(() {
        _mockUpcoming = upcoming;
        _mockCompleted = completed;
        _mockCancelled = cancelled;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _openBoardingPass(Map<String, dynamic> ride) {
    // Navigate to boarding pass screen
    Navigator.of(context).pushNamed(AppRoutes.boardingPass, arguments: ride);
  }

  void _openRideDetails(RideHistoryItem ride) {
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
            _buildTabBar(colors),
            Expanded(
              child: _isLoading 
                ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGold))
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildUpcomingTab(),
                      _buildCompletedTab(),
                      _buildCancelledTab(),
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
        if (Navigator.canPop(context)) ...[
          AppBackButton(onPressed: () => Navigator.of(context).pop()),
          const SizedBox(width: 16),
        ],
        Text('My Bookings', style: AppTextStyles.mediumHeading),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildTabBar(AppColorPalette colors) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(
        color: colors.surfaceSecondary,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          color: AppColors.primaryGold,
          borderRadius: BorderRadius.circular(14),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: AppColors.textOnGold,
        unselectedLabelColor: colors.textSecondary,
        labelStyle: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w600),
        unselectedLabelStyle: AppTextStyles.caption,
        tabs: const [
          Tab(text: 'Upcoming'),
          Tab(text: 'Completed'),
          Tab(text: 'Cancelled'),
        ],
      ),
    ).animate().fadeIn(delay: 80.ms, duration: 300.ms);
  }

  Widget _buildUpcomingTab() {
    if (_mockUpcoming.isEmpty) {
      return _buildEmptyState(
        Icons.event_available, 
        'No upcoming journeys.',
        actionLabel: 'Book a car →',
        onAction: () => Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _mockUpcoming.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: _buildCompactBoardingPass(_mockUpcoming[index]),
        );
      },
    );
  }

  Widget _buildCompactBoardingPass(Map<String, dynamic> ride) {
    final colors = AppColors.of(context);
    return GestureDetector(
      onTap: () => _openBoardingPass(ride),
      child: Container(
        decoration: BoxDecoration(
          color: colors.surfaceCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: colors.inputBorder.withValues(alpha: 0.1)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 15,
              offset: const Offset(0, 8),
            )
          ],
        ),
        child: Column(
          children: [
            // Top Pass section
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(ride['status'], style: AppTextStyles.caption.copyWith(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 10)),
                      ),
                      Text('${ride['date']} • ${ride['time']}', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Text(ride['from'], style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.bold)),
                      ),
                      Icon(Icons.arrow_forward, size: 16, color: colors.textSecondary),
                      Expanded(
                        child: Text(ride['to'], textAlign: TextAlign.end, style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(ride['car'], style: AppTextStyles.caption.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
                          Text(ride['carNo'], style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(ride['total'], style: AppTextStyles.caption.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
                          Text('${ride['advance']} Paid', style: AppTextStyles.caption.copyWith(color: AppColors.success)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Dashed Divider
            Row(
              children: [
                Container(
                  width: 8,
                  height: 16,
                  decoration: BoxDecoration(
                    color: colors.background,
                    borderRadius: const BorderRadius.only(topRight: Radius.circular(8), bottomRight: Radius.circular(8)),
                    border: Border(right: BorderSide(color: colors.inputBorder)),
                  ),
                ),
                Expanded(
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      return Flex(
                        direction: Axis.horizontal,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(
                          (constraints.constrainWidth() / 8).floor(),
                          (index) => SizedBox(width: 4, height: 1, child: DecoratedBox(decoration: BoxDecoration(color: colors.divider))),
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  width: 8,
                  height: 16,
                  decoration: BoxDecoration(
                    color: colors.background,
                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(8), bottomLeft: Radius.circular(8)),
                    border: Border(left: BorderSide(color: colors.inputBorder)),
                  ),
                ),
              ],
            ),
            // Bottom Action
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('View Boarding Pass', style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.w600)),
                  const SizedBox(width: 4),
                  const Icon(Icons.arrow_forward, size: 14, color: AppColors.primaryGold),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompletedTab() {
    if (_mockCompleted.isEmpty) {
      return _buildEmptyState(Icons.history, 'No completed rides yet.');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _mockCompleted.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _PastRideTile(
            ride: _mockCompleted[index],
            onTap: () => _openRideDetails(_mockCompleted[index]),
          ),
        );
      },
    );
  }

  Widget _buildCancelledTab() {
    if (_mockCancelled.isEmpty) {
      return _buildEmptyState(Icons.cancel_outlined, 'No cancelled rides.');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _mockCancelled.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _PastRideTile(
            ride: _mockCancelled[index],
            onTap: () => _openRideDetails(_mockCancelled[index]),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(IconData icon, String message, {String? actionLabel, VoidCallback? onAction}) {
    final colors = AppColors.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: colors.textSecondary, size: 40),
          const SizedBox(height: 12),
          Text(message, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 24),
            TextButton(
              onPressed: onAction,
              child: Text(actionLabel, style: AppTextStyles.button.copyWith(color: AppColors.primaryGold)),
            ),
          ],
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
      color: colors.surfaceCard,
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
                  color: colors.surfaceElevated,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  ride.status == RideStatus.cancelled ? Icons.cancel : Icons.directions_car,
                  color: ride.status == RideStatus.cancelled ? AppColors.error : AppColors.primaryGold,
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
                    Text('${ride.dateLabel} • ${ride.carName ?? ride.vehicleLabel}', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
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
