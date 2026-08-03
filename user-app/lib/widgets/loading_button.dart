// lib/widgets/loading_button.dart
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';

/// Compact text-style button with a built-in loading spinner state — for
/// smaller inline actions that aren't full-width (e.g. "Resend OTP",
/// "Change Email"). For the main full-width CTA, use PrimaryButton instead.
class LoadingButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  const LoadingButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final disabled = onPressed == null || isLoading;

    return Semantics(
      button: true,
      enabled: !disabled,
      label: isLoading ? '$label, loading' : label,
      child: ExcludeSemantics(
        child: TextButton(
          onPressed: disabled ? null : onPressed,
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: isLoading
              ? const SizedBox(
            height: 16,
            width: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryGold),
            ),
          )
              : Text(
            label,
            style: AppTextStyles.link.copyWith(
              color: onPressed == null ? colors.textSecondary : AppColors.primaryGold,
            ),
          ),
        ),
      ),
    );
  }
}
