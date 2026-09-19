// lib/core/theme/app_text_styles.dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Text style hierarchy for the whole app.
/// Inter is used throughout, with tighter headings and relaxed body/caption
/// text (clean, readable). Every screen/widget must use these — never
/// reference the font families directly inside a screen file.
class AppTextStyles {
  AppTextStyles._();

  // Headings — Inter
  static TextStyle largeHeading = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 32,
    letterSpacing: -1.2,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    height: 1.2,
  );

  static TextStyle mediumHeading = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 24,
    letterSpacing: -0.7,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.25,
  );

  static TextStyle priceLarge = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    height: 1.2,
  );

  static TextStyle subtitle = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  // Body & caption — Inter
  static TextStyle body = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.4,
  );

  static TextStyle bodySecondary = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.4,
  );

  static TextStyle caption = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.3,
  );

  // Button label — Inter, used inside primary/secondary buttons
  static TextStyle button = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textOnGold,
  );

  // Link / inline action text (e.g. "Forgot password?", "Resend OTP")
  static TextStyle link = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.primaryGold,
  );

  // Error text under form fields
  static TextStyle errorText = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.error,
  );
}
