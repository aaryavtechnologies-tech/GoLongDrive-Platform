import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../app/theme.dart';

/// Reconstructed from `@/components/ui/input` usage across every screen.
class AppTextField extends StatefulWidget {
  final String label;
  final String? placeholder;
  final IconData? leftIcon;
  final bool isPassword;
  final TextInputType keyboardType;
  final String? errorText;
  final TextEditingController? controller;
  final int? maxLength;
  final TextCapitalization textCapitalization;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onChanged;

  const AppTextField({
    super.key,
    required this.label,
    this.placeholder,
    this.leftIcon,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
    this.errorText,
    this.controller,
    this.maxLength,
    this.textCapitalization = TextCapitalization.none,
    this.inputFormatters,
    this.onChanged,
  });

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  bool _obscured = true;

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: TextStyle(color: AppColors.textSecondary, fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: AppColors.inputFill,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: hasError ? AppColors.error : AppColors.divider),
          ),
          child: TextField(
            controller: widget.controller,
            obscureText: widget.isPassword && _obscured,
            keyboardType: widget.keyboardType,
            maxLength: widget.maxLength,
            textCapitalization: widget.textCapitalization,
            inputFormatters: widget.inputFormatters,
            onChanged: widget.onChanged,
            style: TextStyle(color: AppColors.textPrimary, fontSize: 16),
            decoration: InputDecoration(
              counterText: '',
              hintText: widget.placeholder,
              hintStyle: TextStyle(color: AppColors.textFaint),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              prefixIcon: widget.leftIcon != null
                  ? Icon(widget.leftIcon, color: AppColors.textMuted, size: 22)
                  : null,
              suffixIcon: widget.isPassword
                  ? IconButton(
                      icon: Icon(
                        _obscured ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.textMuted,
                      ),
                      onPressed: () => setState(() => _obscured = !_obscured),
                    )
                  : null,
            ),
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: 6),
          Text(widget.errorText!, style: TextStyle(color: AppColors.error, fontSize: 12)),
        ],
      ],
    );
  }
}
