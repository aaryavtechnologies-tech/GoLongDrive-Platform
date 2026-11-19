// lib/widgets/progress_indicator_dots.dart
import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../core/theme/app_colors.dart';

/// Page indicator dots for the onboarding carousel. Active dot
/// expands into a yellow pill (#FFC928); inactive dots stay subtle border grey (#EEEEEE).
class ProgressIndicatorDots extends StatelessWidget {
  final PageController controller;
  final int count;

  const ProgressIndicatorDots({
    super.key,
    required this.controller,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    return SmoothPageIndicator(
      controller: controller,
      count: count,
      effect: const ExpandingDotsEffect(
        dotHeight: 8,
        dotWidth: 8,
        expansionFactor: 3.5,
        spacing: 6,
        activeDotColor: AppColors.primaryYellow,
        dotColor: AppColors.border,
      ),
    );
  }
}
