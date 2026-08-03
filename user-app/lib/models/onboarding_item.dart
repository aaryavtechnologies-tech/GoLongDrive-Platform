// lib/models/onboarding_item.dart

/// Simple UI-only data model for one onboarding slide.
/// No backend/API involved — this is just static content rendered by
/// onboarding_screen.dart.
class OnboardingItem {
  final String title;
  final String subtitle;
  final String illustrationPath;

  const OnboardingItem({
    required this.title,
    required this.subtitle,
    required this.illustrationPath,
  });
}