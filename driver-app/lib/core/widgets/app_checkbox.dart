import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Square checkbox with gold check state, matching the CheckSquare/Square
/// icon-toggle pattern used in the login "Remember Me" row and the
/// registration "Terms of Service" row.
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
    return GestureDetector(
      onTap: () => onChanged(!value),
      behavior: HitTestBehavior.opaque,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            value ? Icons.check_box : Icons.check_box_outline_blank,
            color: value ? AppColors.gold : AppColors.textMuted,
            size: 22,
          ),
          const SizedBox(width: 8),
          Flexible(child: label),
        ],
      ),
    );
  }
}
