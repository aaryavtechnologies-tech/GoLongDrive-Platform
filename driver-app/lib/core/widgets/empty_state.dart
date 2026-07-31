import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Reusable "nothing here yet" placeholder — icon + title + optional
/// subtitle/action. Used wherever a list or history can legitimately be
/// empty (Rides list, Earnings transaction history, etc.) so every screen
/// shares the same visual language instead of an ad hoc `Center(Text(...))`.
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.surfaceAlt2),
            child: Icon(icon, color: AppColors.textFaint, size: 28),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14, fontWeight: FontWeight.w600),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textFaint, fontSize: 12, height: 1.4),
            ),
          ],
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 16),
            TextButton(
              onPressed: onAction,
              child: Text(actionLabel!, style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600)),
            ),
          ],
        ],
      ),
    );
  }
}
