// lib/core/utils/app_toast.dart
import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'package:toastification/toastification.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class AppToast {
  static void showSuccess(BuildContext context, String message, {String? title}) {
    developer.log('[SUCCESS] ${title ?? ''}: $message', name: 'AppToast');
    final colors = AppColorPalette.dark;
    toastification.show(
      context: context,
      type: ToastificationType.success,
      style: ToastificationStyle.flatColored,
      title: title != null ? Text(title, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.bold, color: colors.textPrimary)) : null,
      description: Text(message, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
      alignment: Alignment.bottomCenter,
      autoCloseDuration: const Duration(seconds: 3),
      primaryColor: colors.successIcon,
      backgroundColor: colors.surface,
      foregroundColor: colors.textPrimary,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: BorderRadius.circular(12),
      showProgressBar: false,
      boxShadow: highModeShadow,
    );
  }

  static void showError(BuildContext context, String message, {String? title}) {
    developer.log('[ERROR] ${title ?? ''}: $message', name: 'AppToast', error: message);
    final colors = AppColorPalette.dark;
    toastification.show(
      context: context,
      type: ToastificationType.error,
      style: ToastificationStyle.flatColored,
      title: title != null ? Text(title, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.bold, color: colors.textPrimary)) : null,
      description: Text(message, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
      alignment: Alignment.bottomCenter,
      autoCloseDuration: const Duration(seconds: 4),
      primaryColor: colors.errorIcon,
      backgroundColor: colors.surface,
      foregroundColor: colors.textPrimary,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: BorderRadius.circular(12),
      showProgressBar: false,
      boxShadow: highModeShadow,
    );
  }

  static void showInfo(BuildContext context, String message, {String? title}) {
    developer.log('[INFO] ${title ?? ''}: $message', name: 'AppToast');
    final colors = AppColorPalette.dark;
    toastification.show(
      context: context,
      type: ToastificationType.info,
      style: ToastificationStyle.flatColored,
      title: title != null ? Text(title, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.bold, color: colors.textPrimary)) : null,
      description: Text(message, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
      alignment: Alignment.bottomCenter,
      autoCloseDuration: const Duration(seconds: 3),
      primaryColor: colors.accentIcon,
      backgroundColor: colors.surface,
      foregroundColor: colors.textPrimary,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: BorderRadius.circular(12),
      showProgressBar: false,
      boxShadow: highModeShadow,
    );
  }
}
