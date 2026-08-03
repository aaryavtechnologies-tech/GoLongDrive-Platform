// lib/widgets/primary_button.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';

/// Main call-to-action button used across the app (e.g. "Get Started",
/// "Login", "Create Account", "Verify"). Gold gradient background matching
/// the logo, with a subtle scale-down animation on press.
///
/// This is UI-only: onPressed just triggers whatever local mock action or
/// navigation the screen wires up — no API calls here.
class PrimaryButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final double height;

  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.height = 54,
  });

  @override
  State<PrimaryButton> createState() => _PrimaryButtonState();
}

class _PrimaryButtonState extends State<PrimaryButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final disabled = widget.onPressed == null || widget.isLoading;

    return Semantics(
      button: true,
      enabled: !disabled,
      label: widget.isLoading ? '${widget.label}, loading' : widget.label,
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
                gradient: disabled ? null : AppColors.primaryGradient,
                color: disabled ? colors.divider : null,
                borderRadius: BorderRadius.circular(18),
              ),
              alignment: Alignment.center,
              child: widget.isLoading
                  ? const SizedBox(
                height: 22,
                width: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.4,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.textOnGold),
                ),
              )
                  : Text(
                widget.label,
                style: AppTextStyles.button.copyWith(
                  color: disabled ? colors.textSecondary : AppColors.textOnGold,
                ),
              ),
            ),
          ),
        ).animate().fadeIn(duration: 300.ms),
      ),
    );
  }
}
