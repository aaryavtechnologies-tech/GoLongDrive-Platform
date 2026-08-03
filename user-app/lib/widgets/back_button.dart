// lib/widgets/back_button.dart
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

/// Circular tappable back-arrow control shown at the top-left of auth
/// screens (Register, Verify Email, Forgot/Reset Password). Wraps
/// Navigator.pop by default, but a custom onPressed can be supplied for
/// mock navigation flows.
class AppBackButton extends StatelessWidget {
  final VoidCallback? onPressed;

  const AppBackButton({super.key, this.onPressed});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Semantics(
      button: true,
      label: 'Back',
      child: ExcludeSemantics(
        child: Material(
          color: colors.surface,
          shape: const CircleBorder(),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: onPressed ?? () => Navigator.maybePop(context),
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Icon(Icons.arrow_back_ios_new, size: 18, color: colors.textPrimary),
            ),
          ),
        ),
      ),
    );
  }
}
