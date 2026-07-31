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
  final isDark = context != null ? Theme.of(context).brightness == Brightness.dark : true;
  return BoxDecoration(
    color: bg ?? (isDark ? AppColors.surface : AppColors.surfaceLight),
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(color: borderColor ?? (isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight)),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
        blurRadius: 8,
        offset: const Offset(0, 4),
      ),
    ],
  );
}

/// Diagonal ride-card / stat-card gradient decoration.
BoxDecoration rideCardDecoration({double radius = 24, BuildContext? context}) {
  return BoxDecoration(
    gradient: context != null ? AppGradients.rideCard(context) : null,
    color: context == null ? AppColors.surface : null, // Fallback
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(
      color: (context != null && Theme.of(context).brightness == Brightness.dark)
          ? Colors.white.withOpacity(0.08)
          : Colors.black.withOpacity(0.05),
    ),
  );
}

/// Form-section card used throughout the registration wizard.
BoxDecoration formSectionDecoration({BuildContext? context}) {
  final isDark = context != null ? Theme.of(context).brightness == Brightness.dark : true;
  return BoxDecoration(
    color: isDark ? AppColors.surface : AppColors.surfaceLight,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(
      color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05),
    ),
  );
}
