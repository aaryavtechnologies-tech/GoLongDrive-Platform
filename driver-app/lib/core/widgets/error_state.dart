import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../data/auth_service.dart';

class ErrorStateWidget extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback? onRetry;
  final bool isNoInternet;
  final String? buttonText;

  const ErrorStateWidget({
    super.key,
    required this.title,
    required this.message,
    this.onRetry,
    this.isNoInternet = false,
    this.buttonText,
  });

  bool get _isAuthError =>
      message.contains('401') ||
      title.contains('401') ||
      message.toLowerCase().contains('unauthorized') ||
      message.toLowerCase().contains('session expired');

  @override
  Widget build(BuildContext context) {
    final bool authError = _isAuthError;
    final String displayTitle = authError ? 'Session Expired' : title;
    final String displayMessage = authError
        ? 'You have been logged out. Please log in again.'
        : message;
    final String displayButtonText = buttonText ?? (authError ? 'Log In Again' : 'Try Again');
    final IconData displayIcon = authError
        ? Icons.lock_outline_rounded
        : (isNoInternet ? Icons.wifi_off_rounded : Icons.error_outline_rounded);
    final Color displayColor = authError ? AppColors.gold : AppColors.error;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: displayColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
                border: Border.all(
                  color: displayColor.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Icon(displayIcon, size: 48, color: displayColor),
            ),
            const SizedBox(height: 24),
            Text(
              displayTitle,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              displayMessage,
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null || authError) ...[
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () async {
                    if (authError) {
                      await AuthService.clearAuth();
                      if (context.mounted) context.go('/login');
                    } else if (onRetry != null) {
                      onRetry!();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                  child: Text(
                    displayButtonText,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
