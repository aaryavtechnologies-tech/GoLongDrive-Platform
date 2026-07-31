import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Reconstructed from `@/components/ui/select` usage in the registration
/// wizard (vehicle type, fuel type, AC availability, state, etc).
/// Tapping opens a bottom sheet list styled to match AppTextField.
class SelectField extends StatelessWidget {
  final String label;
  final String? value;
  final String placeholder;
  final List<String> options;
  final ValueChanged<String> onChanged;
  final IconData? leftIcon;
  final String? errorText;

  const SelectField({
    super.key,
    required this.label,
    required this.value,
    required this.options,
    required this.onChanged,
    this.placeholder = 'Select an option',
    this.leftIcon,
    this.errorText,
  });

  Future<void> _openPicker(BuildContext context) async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(8, 12, 8, 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text(label,
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 8),
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: options.length,
                    itemBuilder: (context, i) {
                      final option = options[i];
                      final isSelected = option == value;
                      return ListTile(
                        title: Text(
                          option,
                          style: TextStyle(
                            color: isSelected ? AppColors.gold : AppColors.textPrimary,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                        trailing: isSelected ? const Icon(Icons.check, color: AppColors.gold) : null,
                        onTap: () => Navigator.of(context).pop(option),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
    if (selected != null) onChanged(selected);
  }

  @override
  Widget build(BuildContext context) {
    final hasError = errorText != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(color: AppColors.textSecondary, fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () => _openPicker(context),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: AppColors.inputFill,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: hasError ? AppColors.error : AppColors.divider),
            ),
            child: Row(
              children: [
                if (leftIcon != null) ...[
                  Icon(leftIcon, color: AppColors.textMuted, size: 22),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: Text(
                    value ?? placeholder,
                    style: TextStyle(
                      color: value != null ? AppColors.textPrimary : AppColors.textFaint,
                      fontSize: 16,
                    ),
                  ),
                ),
                Icon(Icons.keyboard_arrow_down, color: AppColors.textMuted),
              ],
            ),
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: 6),
          Text(errorText!, style: TextStyle(color: AppColors.error, fontSize: 12)),
        ],
      ],
    );
  }
}
