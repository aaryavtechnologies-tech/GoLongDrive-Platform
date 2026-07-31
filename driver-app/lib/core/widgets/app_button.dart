import 'package:flutter/material.dart';
import '../../app/theme.dart';

enum AppButtonVariant { primary, outline, secondary }

/// Reconstructed from `@/components/ui/button` usage across every screen.
/// primary = solid gold bg / black text
/// outline = transparent bg / gold border
/// secondary = dark bg / white border+text
class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final AppButtonVariant variant;
  final Widget? rightIcon;
  final double height;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.variant = AppButtonVariant.primary,
    this.rightIcon,
    this.height = 56,
  });

  @override
  Widget build(BuildContext context) {
    final bg = switch (variant) {
      AppButtonVariant.primary => AppColors.gold,
      AppButtonVariant.outline => Colors.transparent,
      AppButtonVariant.secondary => AppColors.surface,
    };
    final fg = switch (variant) {
      AppButtonVariant.primary => Colors.black,
      AppButtonVariant.outline => AppColors.gold,
      AppButtonVariant.secondary => AppColors.textPrimary,
    };
    final border = variant == AppButtonVariant.primary
        ? null
        : Border.all(
            color: variant == AppButtonVariant.outline
                ? AppColors.gold.withOpacity(0.5)
                : AppColors.dividerStrong,
          );
    final disabled = onPressed == null && !isLoading;

    return Opacity(
      opacity: disabled ? 0.5 : 1,
      child: SizedBox(
        height: height,
        width: double.infinity,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(16),
            border: border,
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: isLoading ? null : onPressed,
              child: Center(
                child: isLoading
                    ? SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.4, color: fg),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            label,
                            style: TextStyle(color: fg, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          if (rightIcon != null) ...[
                            const SizedBox(width: 8),
                            rightIcon!,
                          ],
                        ],
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
