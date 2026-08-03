// lib/widgets/password_field.dart
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';

/// Password input with a show/hide eye-toggle. Used for both the password
/// field and confirm-password field on register/reset-password screens.
///
/// Validation (8+ chars, uppercase, lowercase, number, special char, or
/// "must match password" for confirm) is passed in via [validator] from
/// core/utils/validators.dart — this widget only handles obscuring/toggling.
///
/// [enableStrengthIndicator] + [strength] (0-4) are optional — when
/// enabled, the field's default border stays as-is while empty. As soon
/// as the user types, small colored corner brackets appear (red for weak)
/// and grow along each edge as [strength] increases, meeting to form a
/// full green border at max strength. Login/other screens that don't
/// pass these params are completely unaffected.
class PasswordField extends StatefulWidget {
  final String label;
  final String? hint;
  final TextEditingController controller;
  final String? Function(String?)? validator;
  final AutovalidateMode autovalidateMode;
  final ValueChanged<String>? onChanged;
  final bool enableStrengthIndicator;
  final int strength;

  const PasswordField({
    super.key,
    required this.label,
    required this.controller,
    this.hint,
    this.validator,
    this.autovalidateMode = AutovalidateMode.onUserInteraction,
    this.onChanged,
    this.enableStrengthIndicator = false,
    this.strength = 0,
  });

  @override
  State<PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<PasswordField> {
  bool _obscured = true;

  static const _radius = 16.0;

  /// Strength ramp built from the theme-reactive status colors so the
  /// corner brackets stay visible against the field's fill color in both
  /// modes (in light mode the field sits on the gold card surface).
  Color _colorForStrength(int strength, AppColorPalette colors) {
    switch (strength) {
      case 0:
        return colors.errorIcon; // very weak — red
      case 1:
        return Color.lerp(colors.errorIcon, colors.warningIcon, 0.5)!; // weak — red-orange
      case 2:
        return colors.warningIcon; // fair — amber/orange
      case 3:
        return Color.lerp(colors.warningIcon, colors.successIcon, 0.5)!; // good — yellow-green
      default:
        return colors.successIcon; // strong — green
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
        const SizedBox(height: 8),
        ValueListenableBuilder<TextEditingValue>(
          valueListenable: widget.controller,
          builder: (context, value, _) {
            final hasText = value.text.isNotEmpty;
            final targetArmFraction =
            (widget.enableStrengthIndicator && hasText)
                ? (widget.strength + 1) / 5
                : 0.0;
            final targetColor = _colorForStrength(widget.strength, colors);

            return Stack(
              children: [
                Semantics(
                  textField: true,
                  label: widget.label,
                  obscured: true,
                  child: TextFormField(
                    controller: widget.controller,
                    obscureText: _obscured,
                    validator: widget.validator,
                    onChanged: widget.onChanged,
                    autovalidateMode: widget.autovalidateMode,
                    style: AppTextStyles.body
                        .copyWith(color: colors.textPrimary),
                    decoration: InputDecoration(
                      hintText: widget.hint,
                      prefixIcon: Icon(Icons.lock_outline,
                          color: colors.textSecondary, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscured
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: colors.textSecondary,
                          size: 20,
                        ),
                        tooltip: _obscured ? 'Show password' : 'Hide password',
                        onPressed: () =>
                            setState(() => _obscured = !_obscured),
                      ),
                    ),
                  ),
                ),
                if (widget.enableStrengthIndicator)
                  Positioned.fill(
                    child: IgnorePointer(
                      child: TweenAnimationBuilder<double>(
                        tween: Tween<double>(end: targetArmFraction),
                        duration: const Duration(milliseconds: 250),
                        curve: Curves.easeOut,
                        builder: (context, armFraction, __) {
                          return CustomPaint(
                            painter: _CornerStrengthPainter(
                              color: targetColor,
                              armFraction: armFraction,
                              radius: _radius,
                            ),
                          );
                        },
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }
}

/// Paints growing corner brackets at all four rounded corners of the
/// field. At armFraction 1.0 the brackets meet edge-to-edge, forming a
/// complete border outline.
class _CornerStrengthPainter extends CustomPainter {
  final Color color;
  final double armFraction; // 0..1
  final double radius;
  final double strokeWidth;

  _CornerStrengthPainter({
    required this.color,
    required this.armFraction,
    required this.radius,
    this.strokeWidth = 1.6,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (armFraction <= 0) return;

    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final w = size.width;
    final h = size.height;
    final armH = (w / 2 - radius).clamp(0, double.infinity) * armFraction;
    final armV = (h / 2 - radius).clamp(0, double.infinity) * armFraction;

    final path = Path();

    // Top-left
    path.moveTo(radius + armH, 0);
    path.lineTo(radius, 0);
    path.arcToPoint(Offset(0, radius),
        radius: Radius.circular(radius), clockwise: false);
    path.lineTo(0, radius + armV);

    // Top-right
    path.moveTo(w - radius - armH, 0);
    path.lineTo(w - radius, 0);
    path.arcToPoint(Offset(w, radius),
        radius: Radius.circular(radius), clockwise: true);
    path.lineTo(w, radius + armV);

    // Bottom-right
    path.moveTo(w - radius - armH, h);
    path.lineTo(w - radius, h);
    path.arcToPoint(Offset(w, h - radius),
        radius: Radius.circular(radius), clockwise: false);
    path.lineTo(w, h - radius - armV);

    // Bottom-left
    path.moveTo(radius + armH, h);
    path.lineTo(radius, h);
    path.arcToPoint(Offset(0, h - radius),
        radius: Radius.circular(radius), clockwise: true);
    path.lineTo(0, h - radius - armV);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _CornerStrengthPainter oldDelegate) {
    return oldDelegate.color != color ||
        oldDelegate.armFraction != armFraction ||
        oldDelegate.radius != radius;
  }
}
