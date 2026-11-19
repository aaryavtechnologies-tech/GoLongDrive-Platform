// lib/core/theme/app_colors.dart
import 'package:flutter/material.dart';

/// Single source of truth for all GoLongDrive User App colors.
/// Clean, modern, premium White & Yellow theme (#FFC928 / #FFFFFF / #111111).
/// Dark mode has been completely removed for the User App.
class AppColors {
  AppColors._();

  // Core Theme Tokens (Requirement 1)
  static const Color primaryBrand = Color(0xFFFFC928);      // Primary Brand Yellow
  static const Color primaryYellow = Color(0xFFFFC928);
  static const Color primaryGold = Color(0xFFFFC928);        // Preserves legacy token references
  static const Color primaryGoldDark = Color(0xFFE5B420);    // Pressed / hover yellow state

  static const Color background = Color(0xFFFFFFFF);        // Primary Background (#FFFFFF)
  static const Color cardBackground = Color(0xFFFFFFFF);    // Card Background (#FFFFFF)
  static const Color inputBackground = Color(0xFFF7F7F7);   // Input Background (#F7F7F7)
  static const Color border = Color(0xFFEEEEEE);            // Border Color (#EEEEEE)
  static const Color disabled = Color(0xFFBDBDBD);          // Disabled Color (#BDBDBD)

  static const Color primaryText = Color(0xFF111111);       // Primary Text (#111111)
  static const Color secondaryText = Color(0xFF666666);     // Secondary Text (#666666)
  static const Color textPrimary = Color(0xFF111111);       // Preserves legacy token
  static const Color textSecondary = Color(0xFF666666);     // Preserves legacy token
  static const Color textOnYellow = Color(0xFF111111);      // Black text on yellow buttons
  static const Color textOnGold = Color(0xFF111111);        // Black text on yellow buttons

  static const Color success = Color(0xFF16A34A);           // Success Color (#16A34A)
  static const Color error = Color(0xFFDC2626);             // Error Color (#DC2626)
  static const Color warning = Color(0xFFFFC928);           // Warning Color (#FFC928)

  // Surfaces & Borders (Legacy & Contextual aliases)
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceSecondary = Color(0xFFF7F7F7);
  static const Color surfaceCard = Color(0xFFFFFFFF);
  static const Color surfaceElevated = Color(0xFFFFFBEB);   // Subtle 5% yellow tint for active/selected cards
  static const Color divider = Color(0xFFEEEEEE);
  static const Color inputBorder = Color(0xFFEEEEEE);
  static const Color inputBorderFocused = Color(0xFFFFC928);

  static const Color black = Color(0xFF111111);
  static const Color nearBlack = Color(0xFF111111);
  static const Color hero = Color(0xFF111111);
  static const Color heroText = Color(0xFFFFFFFF);
  static const Color lime = Color(0xFFFFC928);

  // Map Illustrative Tokens
  static const Color mapPaper = Color(0xFFFBFBFB);
  static const Color mapBlock = Color(0xFFF0F0F0);
  static const Color mapPark = Color(0xFFE8F5E9);
  static const Color mapRoad = Color(0xFFFFFFFF);
  static const Color mapRiver = Color(0xFFE0F2FE);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryBrand, primaryBrand],
  );

  /// Always returns the white-and-yellow palette (Dark mode removed).
  static AppColorPalette of(BuildContext context) {
    return AppColorPalette.light;
  }
}

class AppColorPalette {
  final Color background;
  final Color surface;
  final Color surfaceSecondary;
  final Color surfaceCard;
  final Color surfaceElevated;
  final Color textPrimary;
  final Color textSecondary;
  final Color divider;
  final Color inputBorder;
  final Color disabled;
  final Color accentIcon;
  final Color errorIcon;
  final Color warningIcon;
  final Color successIcon;

  Color get inputFill => const Color(0xFFF7F7F7);
  Color get inputBackground => const Color(0xFFF7F7F7);

  const AppColorPalette({
    required this.background,
    required this.surface,
    required this.surfaceSecondary,
    required this.surfaceCard,
    required this.surfaceElevated,
    required this.textPrimary,
    required this.textSecondary,
    required this.divider,
    required this.inputBorder,
    required this.disabled,
    required this.accentIcon,
    required this.errorIcon,
    required this.warningIcon,
    required this.successIcon,
  });

  static const light = AppColorPalette(
    background: Color(0xFFFFFFFF),       // #FFFFFF
    surface: Color(0xFFFFFFFF),          // #FFFFFF
    surfaceSecondary: Color(0xFFF7F7F7), // #F7F7F7
    surfaceCard: Color(0xFFFFFFFF),      // #FFFFFF
    surfaceElevated: Color(0xFFFFFBEB),  // Warm light accent for active cards
    textPrimary: Color(0xFF111111),      // #111111
    textSecondary: Color(0xFF666666),    // #666666
    divider: Color(0xFFEEEEEE),          // #EEEEEE
    inputBorder: Color(0xFFEEEEEE),      // #EEEEEE
    disabled: Color(0xFFBDBDBD),        // #BDBDBD
    accentIcon: Color(0xFFFFC928),       // Yellow accent for highlights
    errorIcon: Color(0xFFDC2626),        // #DC2626
    warningIcon: Color(0xFFFFC928),      // #FFC928
    successIcon: Color(0xFF16A34A),      // #16A34A
  );

  // Dark mode fallback points to light so no screen can show dark mode
  static const dark = light;
}
