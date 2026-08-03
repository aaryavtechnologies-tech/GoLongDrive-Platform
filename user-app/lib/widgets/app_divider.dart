// lib/widgets/app_divider.dart
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';

/// "OR" divider with a line on each side — used between the password login
/// form and the social login button on the Login screen.
class AppDivider extends StatelessWidget {
  final String label;

  const AppDivider({super.key, this.label = 'OR'});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      children: [
        Expanded(child: Divider(color: colors.divider, thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(label, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
        ),
        Expanded(child: Divider(color: colors.divider, thickness: 1)),
      ],
    );
  }
}
