import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Shimmering placeholder block shown while a screen's data is "loading".
/// No external shimmer package dependency — built with a plain
/// `AnimationController` driving a sweeping gradient via `ShaderMask`, so it
/// doesn't add anything to pubspec.yaml.
class SkeletonBox extends StatefulWidget {
  final double width;
  final double height;
  final double radius;

  const SkeletonBox({
    super.key,
    this.width = double.infinity,
    this.height = 14,
    this.radius = 8,
  });

  @override
  State<SkeletonBox> createState() => _SkeletonBoxState();
}

class _SkeletonBoxState extends State<SkeletonBox> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value;
        return ShaderMask(
          shaderCallback: (bounds) => LinearGradient(
            begin: Alignment(-1 + 3 * t, 0),
            end: Alignment(0 + 3 * t, 0),
            colors: [AppColors.surfaceAlt2, AppColors.divider, AppColors.surfaceAlt2],
            stops: const [0.35, 0.5, 0.65],
          ).createShader(bounds),
          child: Container(
            width: widget.width,
            height: widget.height,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(widget.radius),
            ),
          ),
        );
      },
    );
  }
}

/// A card-shaped skeleton — roughly matches the dimensions of a stat card /
/// ride card / list row, for use while that content is loading.
class SkeletonCard extends StatelessWidget {
  final double height;
  const SkeletonCard({super.key, this.height = 80});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          SkeletonBox(width: 120, height: 14),
          SizedBox(height: 12),
          SkeletonBox(width: double.infinity, height: 12),
          SizedBox(height: 8),
          SkeletonBox(width: 160, height: 12),
        ],
      ),
    );
  }
}
