import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../core/widgets/app_button.dart';
import 'registration_provider.dart';

/// Shared shell for all 9 registration steps: black bg, persistent header
/// (title/subtitle/progress bar), scrollable body, and a bottom action bar
/// with a single Next/Continue button.
class RegistrationStepScaffold extends StatelessWidget {
  final IconData? headerIcon;
  final String? headerTitle;
  final String? headerSubtitle;
  final List<Widget> children;
  final VoidCallback onNext;
  final VoidCallback? onBack;
  final bool isNextDisabled;
  final bool isNextLoading;
  final String nextLabel;
  final RegistrationData registration;

  const RegistrationStepScaffold({
    super.key,
    required this.registration,
    this.headerIcon,
    this.headerTitle,
    this.headerSubtitle,
    required this.children,
    required this.onNext,
    this.onBack,
    this.isNextDisabled = false,
    this.isNextLoading = false,
    this.nextLabel = 'Continue',
  });

  @override
  Widget build(BuildContext context) {
    final progress = registration.currentStep / RegistrationData.totalSteps;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // --- RegistrationHeader (persistent, with step progress) ---
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Column(
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
                        onPressed: onBack ?? () => Navigator.of(context).maybePop(),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Text('Driver Registration',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                            const SizedBox(height: 2),
                            Text('Complete the steps to join GoLongDrive',
                                style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 48), // balances the back button
                    ],
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 6,
                      backgroundColor: AppColors.divider,
                      valueColor: const AlwaysStoppedAnimation(AppColors.gold),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Step ${registration.currentStep} of ${RegistrationData.totalSteps}',
                    style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 40),
                child: Column(
                  children: [
                    if (headerIcon != null) ...[
                      Icon(headerIcon, size: 32, color: AppColors.gold),
                      const SizedBox(height: 16),
                      Text(headerTitle!,
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                      const SizedBox(height: 8),
                      Text(headerSubtitle!,
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.4)),
                      const SizedBox(height: 32),
                    ],
                    ...children,
                  ],
                ),
              ),
            ),
            // --- BottomActionBar ---
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.borderSubtle)),
              ),
              child: SafeArea(
                top: false,
                child: AppButton(
                  label: nextLabel,
                  onPressed: isNextDisabled ? null : onNext,
                  isLoading: isNextLoading,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
