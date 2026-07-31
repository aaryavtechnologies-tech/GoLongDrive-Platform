import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Used above auth sub-screens (Forgot Password, OTP, Reset Password).
class ScreenHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  const ScreenHeader({super.key, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(title,
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        const SizedBox(height: 8),
        Text(subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 15, color: AppColors.textSecondary, height: 1.4)),
      ],
    );
  }
}
