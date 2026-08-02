import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/card_decoration.dart';

/// Settings → Terms of Service.
class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  static const _sections = [
    (
      'Acceptance of Terms',
      'By registering as a driver and using the GoLongDrive platform, you agree to comply with and be legally bound by these Terms of Service. If you do not agree to these terms, you may not use the driver application or provide transportation services.',
    ),
    (
      'Driver Requirements',
      'You must hold a valid driver\'s license, vehicle registration, and necessary commercial permits as required by local laws. You are responsible for ensuring your vehicle is safe, insured, and maintained in accordance with our vehicle standards.',
    ),
    (
      'Service Provision',
      'As an independent contractor, you retain the right to accept or decline ride requests. However, frequent cancellations after acceptance may result in a review or suspension of your account to ensure reliability for riders.',
    ),
    (
      'Payments and Fees',
      'GoLongDrive will facilitate payments from riders on your behalf. We will deduct a platform commission fee from the total fare before depositing the remaining balance into your designated bank account according to our payment schedule.',
    ),
    (
      'User Conduct',
      'You agree to treat riders with respect and maintain a professional environment. Any form of discrimination, harassment, or unsafe driving behavior is strictly prohibited and will result in immediate account termination.',
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
                  const Text('Terms of Service', style: AppText.cardHeadline),
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
