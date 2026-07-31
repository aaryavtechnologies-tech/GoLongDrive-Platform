import 'package:flutter/material.dart';

/// ThemeService manages the application's theme state globally.
class ThemeService {
  ThemeService._();
  static final ThemeService instance = ThemeService._();

  final ValueNotifier<ThemeMode> themeMode = ValueNotifier(ThemeMode.dark);

  void toggleTheme() {
    themeMode.value = themeMode.value == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
  }

  bool get isDarkMode => themeMode.value == ThemeMode.dark;
}

/// Design tokens extracted from the original app's StyleSheet values.
/// Updated to be theme-aware.
class AppColors {
  AppColors._();

  // Core Theme Palette
  static const gold = Color(0xFFEAB308);
  static const goldDark = Color(0xFFA16207);
  static const goldTint = Color(0x1AEAB308); // rgba(234,179,8,0.1)
  static const success = Color(0xFF22C55E);
  static const error = Color(0xFFEF4444);
  static const warning = Color(0xFFF59E0B);
  static const info = Color(0xFF3B82F6);

  // Dark Theme Constants
  static const backgroundDark = Color(0xFF000000);
  static const surfaceDark = Color(0xFF09090B);
  static const surfaceAltDark = Color(0xFF111111);
  static const surfaceAlt2Dark = Color(0xFF121214);
  static const inputFillDark = Color(0xFF18181B);
  static const borderSubtleDark = Color(0x0DFFFFFF);
  static const borderSubtle2Dark = Color(0x1AFFFFFF);
  static const textPrimaryDark = Color(0xFFFFFFFF);
  static const textSecondaryDark = Color(0xFFA1A1AA);
  static const dividerDark = Color(0xFF27272A);
  static const dividerStrongDark = Color(0xFF3F3F46);

  // Light Theme Constants (White Yellow Theme)
  // Page background stays pure white; card/surface layers get a warm gold
  // cast so cards read as "yellow" against the white page, matching the
  // "white yellow theme" the light mode was asked for.
  static const backgroundLight = Color(0xFFFFFFFF);
  static const surfaceLight = Color(0xFFFFFBEF);
  static const surfaceAltLight = Color(0xFFFFF6D9);
  static const surfaceAlt2Light = Color(0xFFFFEDB0);
  static const inputFillLight = Color(0xFFFFF6D9);
  static const borderSubtleLight = Color(0x14EAB308);
  static const borderSubtle2Light = Color(0x26EAB308);
  static const textPrimaryLight = Color(0xFF09090B);
  static const textSecondaryLight = Color(0xFF52525B);
  static const dividerLight = Color(0xFFF1E3A8);
  static const dividerStrongLight = Color(0xFFE9D27A);

  // Dynamic getters based on ThemeService
  static Color get background => ThemeService.instance.isDarkMode ? backgroundDark : backgroundLight;
  static Color get surface => ThemeService.instance.isDarkMode ? surfaceDark : surfaceLight;
  static Color get surfaceAlt => ThemeService.instance.isDarkMode ? surfaceAltDark : surfaceAltLight;
  static Color get surfaceAlt2 => ThemeService.instance.isDarkMode ? surfaceAlt2Dark : surfaceAlt2Light;
  static Color get inputFill => ThemeService.instance.isDarkMode ? inputFillDark : inputFillLight;

  static Color get borderSubtle => ThemeService.instance.isDarkMode ? borderSubtleDark : borderSubtleLight;
  static Color get borderSubtle2 => ThemeService.instance.isDarkMode ? borderSubtle2Dark : borderSubtle2Light;

  static Color get textPrimary => ThemeService.instance.isDarkMode ? textPrimaryDark : textPrimaryLight;
  static Color get textSecondary => ThemeService.instance.isDarkMode ? textSecondaryDark : textSecondaryLight;
  static Color get textMuted => const Color(0xFF71717A);
  static Color get textFaint => ThemeService.instance.isDarkMode ? const Color(0xFF52525B) : const Color(0xFFA1A1AA);

  static Color get divider => ThemeService.instance.isDarkMode ? dividerDark : dividerLight;
  static Color get dividerStrong => ThemeService.instance.isDarkMode ? dividerStrongDark : dividerStrongLight;

  static Color get rideCardStart => ThemeService.instance.isDarkMode ? const Color(0xFF1A1A1A) : const Color(0xFFFFFDF3);
  static Color get rideCardEnd => ThemeService.instance.isDarkMode ? const Color(0xFF09090B) : const Color(0xFFFFF6D9);
}

class AppGradients {
  AppGradients._();

  static LinearGradient onboardingBg(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: isDark 
          ? [const Color(0xFF000000), const Color(0xFF111111)]
          : [const Color(0xFFFFFFFF), const Color(0xFFFFF6D9)],
    );
  }

  static LinearGradient rideCard(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: isDark
          ? [AppColors.rideCardStart, AppColors.rideCardEnd]
          : [AppColors.rideCardStart, AppColors.rideCardEnd],
    );
  }

  static const goldBalanceCard = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.gold, AppColors.goldDark],
  );

  /// Radial halo behind the onboarding icon badge.
  static RadialGradient iconHalo() => RadialGradient(colors: [
        AppColors.gold.withOpacity(0.2),
        AppColors.gold.withOpacity(0.05),
      ]);
}

class AppText {
  AppText._();

  static const display = TextStyle(
    fontSize: 36,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
  );

  static const onboardingTitle = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
  );

  static const screenHeaderTitle = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
  );

  static const cardHeadline = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
  );

  static const sectionTitle = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.bold,
  );

  static const balanceAmount = TextStyle(
    fontSize: 48,
    fontWeight: FontWeight.w900,
    letterSpacing: -1,
    color: Colors.black,
  );

  static const body = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
  );

  static const smallLabel = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
  );

  static const micro = TextStyle(
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  );
}

class AppSpacing {
  AppSpacing._();
  static const screenPadding = 24.0;
  static const cardPadding = 20.0;
  static const cardRadiusLarge = 24.0;
  static const cardRadiusSmall = 12.0;
  static const bottomScrollPadding = 100.0;
}

ThemeData buildDarkTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.backgroundDark,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.gold,
      secondary: AppColors.gold,
      surface: AppColors.surfaceDark,
      error: AppColors.error,
    ),
    dividerColor: AppColors.dividerDark,
    textSelectionTheme: const TextSelectionThemeData(
      cursorColor: AppColors.gold,
      selectionColor: Color(0x33EAB308),
      selectionHandleColor: AppColors.gold,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.backgroundDark,
      elevation: 0,
      foregroundColor: AppColors.textPrimaryDark,
    ),
  );
}

ThemeData buildLightTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.backgroundLight,
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: AppColors.gold,
      secondary: AppColors.gold,
      surface: AppColors.surfaceLight,
      error: AppColors.error,
    ),
    dividerColor: AppColors.dividerLight,
    textSelectionTheme: const TextSelectionThemeData(
      cursorColor: AppColors.gold,
      selectionColor: Color(0x33EAB308),
      selectionHandleColor: AppColors.gold,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.backgroundLight,
      elevation: 0,
      foregroundColor: AppColors.textPrimaryLight,
    ),
  );
}
