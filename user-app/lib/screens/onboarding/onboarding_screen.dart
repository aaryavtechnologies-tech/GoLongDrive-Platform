// lib/screens/onboarding/onboarding_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/constants/app_assets.dart';
import '../../models/onboarding_item.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/secondary_button.dart';
import '../../widgets/progress_indicator_dots.dart';
import '../../routes/app_routes.dart';

/// Screen 2 from the checklist. Swipe, skip, next, page dots, and
/// "Get Started" on the last slide. All navigation here is mock — replace
/// the TODOs with real Navigator calls once routes/app_routes.dart exists.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentPage = 0;

  static const List<OnboardingItem> _items = [
    OnboardingItem(
      title: 'Book a ride in seconds',
      subtitle: 'Set your pickup and destination, and get matched with a nearby driver instantly.',
      illustrationPath: AppAssets.illustrationRideBooking,
    ),
    OnboardingItem(
      title: 'Verified, trusted drivers',
      subtitle: 'Every driver is background-checked and verified for your safety and peace of mind.',
      illustrationPath: AppAssets.illustrationVerifiedDrivers,
    ),
    OnboardingItem(
      title: 'Track your ride live',
      subtitle: 'Watch your driver approach in real time, with accurate ETAs every step of the way.',
      illustrationPath: AppAssets.illustrationRealTimeTracking,
    ),
    OnboardingItem(
      title: 'Pay your way',
      subtitle: 'Cash, card, or wallet — choose whatever payment method works best for you.',
      illustrationPath: AppAssets.illustrationPayments,
    ),
    OnboardingItem(
      title: 'Loved by riders everywhere',
      subtitle: 'Join thousands of happy customers enjoying safe, reliable rides every day.',
      illustrationPath: AppAssets.illustrationHappyCustomer,
    ),
  ];

  bool get _isLastPage => _currentPage == _items.length - 1;

  void _goToNext() {
    if (_isLastPage) {
      _onGetStarted();
    } else {
      _controller.nextPage(duration: const Duration(milliseconds: 350), curve: Curves.easeOut);
    }
  }

  void _onSkip() {
    Navigator.of(context).pushReplacementNamed(AppRoutes.login);
  }

  void _onGetStarted() {
    Navigator.of(context).pushReplacementNamed(AppRoutes.login);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button, hidden on the last page
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 20, top: 8),
                child: Opacity(
                  opacity: _isLastPage ? 0 : 1,
                  child: TextButton(
                    onPressed: _isLastPage ? null : _onSkip,
                    child: Text('Skip', style: AppTextStyles.link),
                  ),
                ),
              ),
            ),

            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _items.length,
                onPageChanged: (index) => setState(() => _currentPage = index),
                itemBuilder: (context, index) {
                  final item = _items[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SvgPicture.asset(
                          item.illustrationPath,
                          height: 260,
                        ).animate(key: ValueKey(index)).fadeIn(duration: 400.ms).slideY(
                          begin: 0.08,
                          end: 0,
                          duration: 400.ms,
                          curve: Curves.easeOut,
                        ),
                        const SizedBox(height: 36),
                        Text(
                          item.title,
                          textAlign: TextAlign.center,
                          style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary),
                        ).animate(key: ValueKey('title_$index')).fadeIn(delay: 150.ms, duration: 400.ms),
                        const SizedBox(height: 12),
                        Text(
                          item.subtitle,
                          textAlign: TextAlign.center,
                          style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                        ).animate(key: ValueKey('subtitle_$index')).fadeIn(delay: 250.ms, duration: 400.ms),
                      ],
                    ),
                  );
                },
              ),
            ),

            ProgressIndicatorDots(controller: _controller, count: _items.length),
            const SizedBox(height: 28),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: _isLastPage
                  ? PrimaryButton(label: 'Get Started', onPressed: _onGetStarted)
                  : Row(
                children: [
                  Expanded(
                    child: SecondaryButton(label: 'Back', onPressed: _currentPage == 0 ? null : () {
                      _controller.previousPage(duration: const Duration(milliseconds: 350), curve: Curves.easeOut);
                    }),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: PrimaryButton(label: 'Next', onPressed: _goToNext),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}