import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/services/socket_service.dart';

class ActiveRideScreen extends StatefulWidget {
  final String bookingId;

  const ActiveRideScreen({super.key, required this.bookingId});

  @override
  State<ActiveRideScreen> createState() => _ActiveRideScreenState();
}

class _ActiveRideScreenState extends State<ActiveRideScreen> {
  StreamSubscription? _rideCompletedSub;

  @override
  void initState() {
    super.initState();
    _rideCompletedSub = UserSocketService.onRideCompleted.listen((data) {
      if (!mounted) return;
      if (data['bookingId'] == widget.bookingId) {
        Navigator.of(context).pushReplacementNamed(
          '/ride-summary',
          arguments: widget.bookingId,
        );
      }
    });
  }

  @override
  void dispose() {
    _rideCompletedSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      appBar: AppBar(
        title: Text('Trip in Progress', style: AppTextStyles.h2.copyWith(color: AppColors.of(context).textPrimary)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false, // User shouldn't navigate back during active ride
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.directions_car, size: 80, color: AppColors.primaryGold),
            const SizedBox(height: 24),
            Text(
              'Your ride is in progress.',
              style: AppTextStyles.largeHeading.copyWith(color: AppColors.of(context).textPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              'Sit back and relax.\nThe trip will complete automatically when you arrive.',
              style: AppTextStyles.bodySecondary.copyWith(color: AppColors.of(context).textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            const CircularProgressIndicator(color: AppColors.primaryGold),
          ],
        ),
      ),
    );
  }
}
