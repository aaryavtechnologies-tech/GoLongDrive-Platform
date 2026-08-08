// lib/widgets/app_text_field.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';

/// Standard text input used for name, email, mobile, and similar fields
/// across auth screens. Relies on the app-wide InputDecorationTheme (borders,
/// radius, colors) set in app_theme.dart, so it only needs to specify what's
/// unique per field: label, hint, icon, keyboard type, and a validator.
///
/// This is local-only UI validation (no backend calls) — pass a validator
/// function from core/utils/validators.dart.
class AppTextField extends StatelessWidget {
  final String label;
  final String? hint;
  final TextEditingController controller;
  final TextInputType keyboardType;
  final IconData? prefixIcon;
  final String? Function(String?)? validator;
  final AutovalidateMode autovalidateMode;
  final int maxLines;
  final bool enabled;
  final int? maxLength;
  final List<TextInputFormatter>? inputFormatters;

  const AppTextField({
    super.key,
    required this.label,
    required this.controller,
    this.hint,
    this.keyboardType = TextInputType.text,
    this.prefixIcon,
    this.validator,
    this.autovalidateMode = AutovalidateMode.onUserInteraction,
    this.maxLines = 1,
    this.enabled = true,
    this.maxLength,
    this.inputFormatters,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
        const SizedBox(height: 8),
        Semantics(
          textField: true,
          label: label,
          child: TextFormField(
            controller: controller,
            keyboardType: keyboardType,
            maxLines: maxLines,
            maxLength: maxLength,
            inputFormatters: inputFormatters,
            enabled: enabled,
            validator: validator,
            autovalidateMode: autovalidateMode,
            style: AppTextStyles.body.copyWith(color: colors.textPrimary),
            decoration: InputDecoration(
              hintText: hint,
              prefixIcon: prefixIcon != null
                  ? Icon(prefixIcon, color: colors.textSecondary, size: 20)
                  : null,
            ),
          ),
        ),
      ],
    );
  }
}
