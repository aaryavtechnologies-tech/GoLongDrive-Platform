// lib/core/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

/// Single ThemeData for the whole app. app.dart should only ever reference
/// AppTheme.dark / AppTheme.light — never build a ThemeData inline.
class AppTheme {
  AppTheme._();

  static ThemeData get dark => _build(AppColorPalette.dark, Brightness.dark);

  static ThemeData get light => _build(AppColorPalette.light, Brightness.light);

  static ThemeData _build(AppColorPalette colors, Brightness brightness) {
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: colors.background,
      primaryColor: AppColors.primaryGold,

      colorScheme: brightness == Brightness.dark
          ? ColorScheme.dark(
              primary: AppColors.primaryGold,
              onPrimary: AppColors.textOnGold,
              secondary: AppColors.primaryGoldDark,
              surface: colors.surface,
              onSurface: colors.textPrimary,
              error: AppColors.error,
            )
          : ColorScheme.light(
              primary: AppColors.primaryGold,
              onPrimary: AppColors.textOnGold,
              secondary: AppColors.primaryGoldDark,
              surface: colors.surface,
              onSurface: colors.textPrimary,
              error: AppColors.error,
            ),

      textTheme: TextTheme(
        headlineLarge: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary),
        headlineMedium: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary),
        titleMedium: AppTextStyles.subtitle.copyWith(color: colors.textPrimary),
        bodyMedium: AppTextStyles.body.copyWith(color: colors.textPrimary),
        bodySmall: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
        labelSmall: AppTextStyles.caption.copyWith(color: colors.textSecondary),
      ),

      appBarTheme: AppBarTheme(
        backgroundColor: colors.background,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: colors.textPrimary),
        titleTextStyle: AppTextStyles.subtitle.copyWith(color: colors.textPrimary),
      ),

      // Base styling for form fields — screens/widgets can still override
      // per-field via copyWith, but this keeps borders/radius consistent
      // across the whole app without repeating it everywhere.
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: colors.divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: colors.divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.inputBorderFocused, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        hintStyle: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
        errorStyle: AppTextStyles.errorText,
      ),

      // Default elevated/gradient buttons will still use the shared
      // widgets/primary_button.dart, but this sets a sane fallback for any
      // plain ElevatedButton used elsewhere.
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryGold,
          foregroundColor: AppColors.textOnGold,
          textStyle: AppTextStyles.button,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ),

      dividerTheme: DividerThemeData(
        color: colors.divider,
        thickness: 1,
      ),
    );
  }
}