// lib/widgets/app_checkbox.dart
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

/// Custom checkbox with yellow accent (#FFC928) and black checkmark (#111111),
/// used for "Remember me" (Login) and "I agree to Terms & Conditions" (Register).
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
                color: value ? AppColors.primaryYellow : AppColors.inputBackground,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: value ? AppColors.primaryYellow : AppColors.border,
                  width: 1.5,
                ),
              ),
              child: value
                  ? const Icon(Icons.check, size: 14, color: AppColors.textOnYellow)
                  : null,
            ),
            const SizedBox(width: 10),
            Expanded(child: label),
          ],
        ),
      ),
    );
  }
}
