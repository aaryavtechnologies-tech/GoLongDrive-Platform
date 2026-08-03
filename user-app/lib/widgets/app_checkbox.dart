// lib/widgets/app_checkbox.dart
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';

/// Custom checkbox with gold accent, used for "Remember me" (Login) and
/// "I agree to Terms & Conditions" (Register). Label is tappable too, not
/// just the box itself.
class AppCheckbox extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;
  final Widget label;

  const AppCheckbox({
    super.key,
    required this.value,
    required this.onChanged,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Semantics(
      checked: value,
      child: InkWell(
        onTap: () => onChanged(!value),
        borderRadius: BorderRadius.circular(8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              height: 20,
              width: 20,
              margin: const EdgeInsets.only(top: 2),
              decoration: BoxDecoration(
                color: value ? AppColors.primaryGold : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: value ? AppColors.primaryGold : colors.inputBorder,
                  width: 1.4,
                ),
              ),
              child: value
                  ? const Icon(Icons.check, size: 14, color: AppColors.textOnGold)
                  : null,
            ),
            const SizedBox(width: 10),
            Flexible(
              child: DefaultTextStyle(
                style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                child: label,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
