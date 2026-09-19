import 'package:flutter/material.dart';

/// ThemeService manages the application's theme state globally.
class ThemeService {
  ThemeService._();
  static final ThemeService instance = ThemeService._();

  final ValueNotifier<ThemeMode> themeMode = ValueNotifier(ThemeMode.light);

  void toggleTheme() {
    themeMode.value =
        themeMode.value == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
  }

  bool get isDarkMode => themeMode.value == ThemeMode.dark;
}

/// Design tokens extracted from the original app's StyleSheet values.
/// Updated to be theme-aware with royal blue primary and warm cream surfaces.
class AppColors {
  AppColors._();

  // Core Theme Palette
  // Kept under the original token names so existing screens remain source
  // compatible. Focused royal mobility-blue with warm cream secondary.
  static const gold = Color(0xFF1E56D8);
  static const goldDark = Color(0xFF1444B8);
  static const goldTint = Color(0x1F1E56D8);
  static const secondary = Color(0xFFD4C3A3);
  static const success = Color(0xFF22C55E);
  static const error = Color(0xFFEF4444);
  static const warning = Color(0xFFF59E0B);
  static const info = Color(0xFF2563EB);

  // Dark Theme Constants (Deep Midnight Blue with Warm Cream Contrasts)
  static const backgroundDark = Color(0xFF08101E);
  static const surfaceDark = Color(0xFF0E1A30);
  static const surfaceAltDark = Color(0xFF142440);
  static const surfaceAlt2Dark = Color(0xFF1B2E50);
  static const inputFillDark = Color(0xFF112038);
  static const borderSubtleDark = Color(0x2E3B82F6);
  static const borderSubtle2Dark = Color(0x4D3B82F6);
  static const textPrimaryDark =
      Color(0xFFFAF5EC); // Warm cream text for soft, premium contrast
  static const textSecondaryDark = Color(0xFFBAC7DA);
  static const dividerDark = Color(0xFF1B3050);
  static const dividerStrongDark = Color(0xFF28446E);

  // Light Theme Constants: Warm cream surfaces in place of stark white, paired with royal blue.
  static const backgroundLight = Color(0xFFF5F0E6); // Soft warm cream canvas
  static const surfaceLight =
      Color(0xFFFFFDF8); // Luxurious warm ivory cream surface
  static const surfaceAltLight =
      Color(0xFFEFE7D8); // Warm cream secondary layer
  static const surfaceAlt2Light = Color(0xFFE5DAC7); // Richer cream tone
  static const inputFillLight = Color(0xFFEFE8DA); // Warm cream input fill
  static const borderSubtleLight = Color(0x221E56D8);
  static const borderSubtle2Light = Color(0x3D1E56D8);
  static const textPrimaryLight =
      Color(0xFF0F1A2E); // Deep midnight navy for high contrast
  static const textSecondaryLight = Color(0xFF505F75);
  static const dividerLight = Color(0xFFE2D6C3);
  static const dividerStrongLight = Color(0xFFCABBA4);

  // Dynamic getters based on ThemeService
  static Color get background =>
      ThemeService.instance.isDarkMode ? backgroundDark : backgroundLight;
  static Color get surface =>
      ThemeService.instance.isDarkMode ? surfaceDark : surfaceLight;
  static Color get surfaceAlt =>
      ThemeService.instance.isDarkMode ? surfaceAltDark : surfaceAltLight;
  static Color get surfaceAlt2 =>
      ThemeService.instance.isDarkMode ? surfaceAlt2Dark : surfaceAlt2Light;
  static Color get inputFill =>
      ThemeService.instance.isDarkMode ? inputFillDark : inputFillLight;

  static Color get borderSubtle =>
      ThemeService.instance.isDarkMode ? borderSubtleDark : borderSubtleLight;
  static Color get borderSubtle2 =>
      ThemeService.instance.isDarkMode ? borderSubtle2Dark : borderSubtle2Light;

  static Color get textPrimary =>
      ThemeService.instance.isDarkMode ? textPrimaryDark : textPrimaryLight;
  static Color get textSecondary =>
      ThemeService.instance.isDarkMode ? textSecondaryDark : textSecondaryLight;
  static Color get textMuted => ThemeService.instance.isDarkMode
      ? const Color(0xFF8295AC)
      : const Color(0xFF66768A);
  static Color get textFaint => ThemeService.instance.isDarkMode
      ? const Color(0xFF61758D)
      : const Color(0xFF94A3B8);

  static Color get divider =>
      ThemeService.instance.isDarkMode ? dividerDark : dividerLight;
  static Color get dividerStrong =>
      ThemeService.instance.isDarkMode ? dividerStrongDark : dividerStrongLight;

  static Color get rideCardStart =>
      ThemeService.instance.isDarkMode ? const Color(0xFF142440) : surfaceLight;
  static Color get rideCardEnd => ThemeService.instance.isDarkMode
      ? const Color(0xFF0E1A30)
      : surfaceAlt2Light;
}

class AppGradients {
  AppGradients._();

  static LinearGradient onboardingBg(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: isDark
          ? [const Color(0xFF08101E), const Color(0xFF142440)]
          : [AppColors.surfaceLight, AppColors.backgroundLight],
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
        AppColors.gold.withValues(alpha: 0.2),
        AppColors.gold.withValues(alpha: 0.05),
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
    color: Colors.white,
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
  const scheme = ColorScheme.dark(
    primary: AppColors.gold,
    secondary: Color(0xFFE8DFCD), // warm cream secondary accent
    surface: AppColors.surfaceDark,
    error: AppColors.error,
  );
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.backgroundDark,
    brightness: Brightness.dark,
    colorScheme: scheme,
    dividerColor: AppColors.dividerDark,
    textSelectionTheme: const TextSelectionThemeData(
      cursorColor: AppColors.gold,
      selectionColor: Color(0x331E56D8),
      selectionHandleColor: AppColors.gold,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.backgroundDark,
      elevation: 0,
      scrolledUnderElevation: 0,
      foregroundColor: AppColors.textPrimaryDark,
    ),
    cardTheme: CardThemeData(
      color: AppColors.surfaceDark,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.dividerDark),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.gold,
        foregroundColor: const Color(0xFFFFFDF8),
        minimumSize: const Size(48, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.inputFillDark,
      hintStyle: const TextStyle(color: AppColors.textSecondaryDark),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.dividerDark),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.dividerDark),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
      ),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: AppColors.surfaceDark,
      modalBackgroundColor: AppColors.surfaceDark,
      showDragHandle: true,
      dragHandleColor: AppColors.textSecondaryDark,
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.surfaceDark,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: AppColors.surfaceAlt2Dark,
      contentTextStyle: const TextStyle(color: AppColors.textPrimaryDark),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    ),
  );
}

ThemeData buildLightTheme() {
  const scheme = ColorScheme.light(
    primary: AppColors.gold,
    secondary: Color(0xFFD4C3A3), // warm cream secondary accent
    surface: AppColors.surfaceLight,
    error: AppColors.error,
  );
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.backgroundLight,
    brightness: Brightness.light,
    colorScheme: scheme,
    dividerColor: AppColors.dividerLight,
    textSelectionTheme: const TextSelectionThemeData(
      cursorColor: AppColors.gold,
      selectionColor: Color(0x331E56D8),
      selectionHandleColor: AppColors.gold,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.backgroundLight,
      elevation: 0,
      scrolledUnderElevation: 0,
      foregroundColor: AppColors.textPrimaryLight,
    ),
    cardTheme: CardThemeData(
      color: AppColors.surfaceLight,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.dividerLight),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.gold,
        foregroundColor: const Color(0xFFFFFDF8),
        minimumSize: const Size(48, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
      ),
    ),
  );
}
