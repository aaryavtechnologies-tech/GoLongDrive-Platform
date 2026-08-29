import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../widgets/primary_button.dart';

class RideSummaryScreen extends StatelessWidget {
  final String bookingId;

  const RideSummaryScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle_outline, size: 100, color: AppColors.success),
              const SizedBox(height: 24),
              Text(
                'Trip Completed!',
                style: AppTextStyles.largeHeading.copyWith(color: AppColors.of(context).textPrimary),
              ),
              const SizedBox(height: 16),
              Text(
                'We hope you enjoyed your ride.\nBooking ID: $bookingId',
                style: AppTextStyles.bodySecondary.copyWith(color: AppColors.of(context).textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              PrimaryButton(
                label: 'Back to Home',
                onPressed: () {
                  Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
