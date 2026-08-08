// lib/core/utils/app_toast.dart
import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'package:toastification/toastification.dart';
import '../../app/theme.dart';

class AppToast {
  static void showSuccess(BuildContext context, String message, {String? title}) {
    developer.log('[SUCCESS] ${title ?? ''}: $message', name: 'AppToast');
    toastification.show(
      context: context,
      type: ToastificationType.success,
      style: ToastificationStyle.flat,
      title: title != null ? Text(title, style: AppText.body.copyWith(fontWeight: FontWeight.bold, color: Colors.white)) : null,
      description: Text(message, style: AppText.body.copyWith(color: Colors.white70)),
      alignment: Alignment.bottomCenter,
      autoCloseDuration: const Duration(seconds: 3),
      primaryColor: AppColors.success,
      backgroundColor: Colors.black,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: BorderRadius.circular(12),
      showProgressBar: false,
      boxShadow: highModeShadow,
    );
  }

  static void showError(BuildContext context, String message, {String? title}) {
    developer.log('[ERROR] ${title ?? ''}: $message', name: 'AppToast', error: message);
    toastification.show(
      context: context,
      type: ToastificationType.error,
      style: ToastificationStyle.flat,
      title: title != null ? Text(title, style: AppText.body.copyWith(fontWeight: FontWeight.bold, color: Colors.white)) : null,
      description: Text(message, style: AppText.body.copyWith(color: Colors.white70)),
      alignment: Alignment.bottomCenter,
      autoCloseDuration: const Duration(seconds: 4),
      primaryColor: AppColors.error,
      backgroundColor: Colors.black,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: BorderRadius.circular(12),
      showProgressBar: false,
      boxShadow: highModeShadow,
    );
  }

  static void showInfo(BuildContext context, String message, {String? title}) {
    developer.log('[INFO] ${title ?? ''}: $message', name: 'AppToast');
    toastification.show(
      context: context,
      type: ToastificationType.info,
      style: ToastificationStyle.flat,
      title: title != null ? Text(title, style: AppText.body.copyWith(fontWeight: FontWeight.bold, color: Colors.white)) : null,
      description: Text(message, style: AppText.body.copyWith(color: Colors.white70)),
      alignment: Alignment.bottomCenter,
      autoCloseDuration: const Duration(seconds: 3),
      primaryColor: Colors.white,
      backgroundColor: Colors.black,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: BorderRadius.circular(12),
      showProgressBar: false,
      boxShadow: highModeShadow,
    );
  }
}
