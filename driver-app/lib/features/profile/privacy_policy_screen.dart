import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/card_decoration.dart';

/// Settings → Privacy Policy.
/// Static content screen — placeholder copy until legal provides the real
/// policy text; structure (sections + last-updated date) is ready to swap
/// in the final content without touching layout.
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  static const _sections = [
    (
      'Information We Collect',
      'We collect information you provide directly, such as your name, phone number, email, vehicle details, and documents submitted during registration. We also collect ride and location data while you are online, to match you with riders and calculate fares.',
    ),
    (
      'How We Use Your Information',
      'Your information is used to operate the driver app: matching you with ride requests, processing payments, verifying your documents, and providing support. We may also use it to improve safety and app performance.',
    ),
    (
      'Location Data',
      'We collect precise location data while you are online and during active trips, so riders can see your position and so we can calculate accurate routes, ETAs, and fares. You can disable location access in your device settings, but this will prevent you from receiving ride requests.',
    ),
    (
      'Sharing Your Information',
      'We share limited information (such as your name, vehicle, and rating) with riders for an active trip. We do not sell your personal information to third parties.',
    ),
    (
      'Data Retention',
      'We retain your information for as long as your account is active and as needed to comply with legal obligations, resolve disputes, and enforce our agreements.',
    ),
    (
      'Your Choices',
      'You can review and update your profile information at any time from Settings → Edit Profile. You can also reach out to Support to request a copy of your data or ask that it be deleted, subject to legal requirements.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 24, 8),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: 4),
                  const Text('Privacy Policy', style: AppText.cardHeadline),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                children: [
                  Text('Last updated: July 1, 2026',
                      style: TextStyle(color: AppColors.textFaint, fontSize: 12)),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: cardDecoration(radius: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        for (var i = 0; i < _sections.length; i++) ...[
                          Text(_sections[i].$1,
                              style: TextStyle(
                                  color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 8),
                          Text(_sections[i].$2,
                              style: TextStyle(color: AppColors.textSecondary, fontSize: 13.5, height: 1.5)),
                          if (i != _sections.length - 1) ...[
                            const SizedBox(height: 20),
                            Divider(color: AppColors.divider, height: 1),
                            const SizedBox(height: 20),
                          ],
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
