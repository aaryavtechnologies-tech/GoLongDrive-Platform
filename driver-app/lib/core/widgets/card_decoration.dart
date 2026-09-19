import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// The "Card Recipe" extracted from every screen that ships exact styling.
/// Reused for every reconstructed (inferred) card in the app.
BoxDecoration cardDecoration({
  Color? bg,
  double radius = 20,
  Color? borderColor,
  BuildContext? context,
}) {
  final isDark = context != null
      ? Theme.of(context).brightness == Brightness.dark
      : ThemeService.instance.isDarkMode;
  return BoxDecoration(
    color: bg ?? (isDark ? AppColors.surface : AppColors.surfaceLight),
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(
        color: borderColor ??
            (isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight)),
    boxShadow: [
      BoxShadow(
        color: isDark
            ? Colors.black.withValues(alpha: 0.25)
            : const Color(0xFF2C2416).withValues(alpha: 0.05),
        blurRadius: 8,
        offset: const Offset(0, 4),
      ),
    ],
  );
}

/// Diagonal ride-card / stat-card gradient decoration.
BoxDecoration rideCardDecoration({double radius = 24, BuildContext? context}) {
  final isDark = context != null
      ? Theme.of(context).brightness == Brightness.dark
      : ThemeService.instance.isDarkMode;
  return BoxDecoration(
    gradient: context != null ? AppGradients.rideCard(context) : null,
    color: context == null ? AppColors.surface : null, // Fallback
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(
      color: isDark
          ? Colors.white.withValues(alpha: 0.08)
          : AppColors.borderSubtleLight,
    ),
  );
}

/// Form-section card used throughout the registration wizard.
BoxDecoration formSectionDecoration({BuildContext? context}) {
  final isDark = context != null
      ? Theme.of(context).brightness == Brightness.dark
      : ThemeService.instance.isDarkMode;
  return BoxDecoration(
    color: isDark ? AppColors.surface : AppColors.surfaceLight,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(
      color: isDark
          ? Colors.white.withValues(alpha: 0.05)
          : AppColors.borderSubtleLight,
    ),
  );
}
