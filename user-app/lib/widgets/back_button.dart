// lib/widgets/back_button.dart
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../routes/app_routes.dart';

/// Circular tappable back-arrow control shown at the top-left of auth and sub screens.
/// Defaults to popping the current route if possible, or gracefully falling back
/// to the Login screen if no previous route exists in the navigation stack.
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
            onTap: onPressed ?? () {
              if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              } else {
                Navigator.of(context).pushNamedAndRemoveUntil(
                  AppRoutes.login,
                  (route) => false,
                );
              }
            },
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
