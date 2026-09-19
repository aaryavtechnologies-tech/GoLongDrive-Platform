import 'package:flutter/material.dart';
import 'theme_scope.dart';

/// Shared evergreen and warm-paper palette. Legacy token names preserve
/// compatibility across existing screens; original brand artwork is unchanged.
class AppColors {
  AppColors._();
  static const primaryGold = Color(0xFF267568);
  static const primaryGoldDark = Color(0xFF1D6055);
  static const black = Color(0xFF071411);
  static const nearBlack = Color(0xFF0D211C);
  static const surfaceSecondary = Color(0xFF123029);
  static const surfaceCard = Color(0xFF102821);
  static const surfaceElevated = Color(0xFF193B33);
  static const textPrimary = Color(0xFFF4F7F3);
  static const textSecondary = Color(0xFFAAC3B9);
  static const textOnGold = Color(0xFFFFFFFF);
  static const divider = Color(0xFF21483E);
  static const inputBorder = Color(0xFF37675B);
  static const inputBorderFocused = primaryGold;
  static const success = Color(0xFF3B916E);
  static const error = Color(0xFFCC4E49);
  static const warning = Color(0xFFAD752B);
  static const hero = Color(0xFF163E35);
  static const heroText = Color(0xFFF4F3E8);
  static const lime = Color(0xFFD9E9AC);
  static const mapPaper = Color(0xFFE8EBDF);
  static const mapBlock = Color(0xFFD9DED0);
  static const mapPark = Color(0xFFCEDBBE);
  static const mapRoad = Color(0xFFFAFAF2);
  static const mapRiver = Color(0xFFBDCFD0);
  static const primaryGradient =
      LinearGradient(colors: [primaryGold, primaryGold]);

  static AppColorPalette of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<ThemeScope>();
    final isDark = scope?.notifier?.isDark ??
        Theme.of(context).brightness == Brightness.dark;
    return isDark ? AppColorPalette.dark : AppColorPalette.light;
  }
}

class AppColorPalette {
  final Color background,
      surface,
      surfaceSecondary,
      surfaceCard,
      surfaceElevated,
      textPrimary,
      textSecondary,
      divider,
      inputBorder,
      accentIcon,
      errorIcon,
      warningIcon,
      successIcon;
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
    required this.accentIcon,
    required this.errorIcon,
    required this.warningIcon,
    required this.successIcon,
  });
  static const dark = AppColorPalette(
    background: AppColors.black,
    surface: AppColors.nearBlack,
    surfaceSecondary: AppColors.surfaceSecondary,
    surfaceCard: AppColors.surfaceCard,
    surfaceElevated: AppColors.surfaceElevated,
    textPrimary: AppColors.textPrimary,
    textSecondary: AppColors.textSecondary,
    divider: AppColors.divider,
    inputBorder: AppColors.inputBorder,
    accentIcon: Color(0xFFA8D6C3),
    errorIcon: Color(0xFFFFA39A),
    warningIcon: Color(0xFFE9C489),
    successIcon: Color(0xFFA8D6C3),
  );
  static const light = AppColorPalette(
    background: Color(0xFFF6F5EF),
    surface: Color(0xFFFFFFFF),
    surfaceSecondary: Color(0xFFEFEEE6),
    surfaceCard: Color(0xFFFFFFFF),
    surfaceElevated: Color(0xFFE5EBE1),
    textPrimary: Color(0xFF192E27),
    textSecondary: Color(0xFF65716A),
    divider: Color(0xFFDDDFD5),
    inputBorder: Color(0xFFBAC3B8),
    accentIcon: AppColors.primaryGold,
    errorIcon: Color(0xFFB13E38),
    warningIcon: Color(0xFF875D20),
    successIcon: Color(0xFF267568),
  );
}
