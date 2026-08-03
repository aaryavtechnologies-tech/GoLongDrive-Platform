// lib/widgets/secondary_button.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';

/// Outlined / ghost-style button used for secondary actions that sit
/// alongside a PrimaryButton (e.g. "Skip" next to "Next", "Cancel" next to
/// "Confirm"). Transparent background, gold border + text, same press-scale
/// feel as PrimaryButton for visual consistency.
class SecondaryButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final double height;

  const SecondaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.height = 54,
  });

  @override
  State<SecondaryButton> createState() => _SecondaryButtonState();
}

class _SecondaryButtonState extends State<SecondaryButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final disabled = widget.onPressed == null;

    return Semantics(
      button: true,
      enabled: !disabled,
      label: widget.label,
      child: ExcludeSemantics(
        child: GestureDetector(
          onTapDown: disabled ? null : (_) => setState(() => _pressed = true),
          onTapUp: disabled ? null : (_) => setState(() => _pressed = false),
          onTapCancel: disabled ? null : () => setState(() => _pressed = false),
          onTap: disabled ? null : widget.onPressed,
          child: AnimatedScale(
            scale: _pressed ? 0.97 : 1.0,
            duration: const Duration(milliseconds: 120),
            child: Container(
              height: widget.height,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: disabled ? colors.divider : AppColors.primaryGold,
                  width: 1.4,
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                widget.label,
                style: AppTextStyles.button.copyWith(
                  color: disabled ? colors.textSecondary : AppColors.primaryGold,
                ),
              ),
            ),
          ),
        ).animate().fadeIn(duration: 300.ms),
      ),
    );
  }
}
