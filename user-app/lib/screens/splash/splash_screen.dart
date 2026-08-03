// lib/screens/splash/splash_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/constants/app_assets.dart';
import '../../routes/app_routes.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // After the splash animation, move on to onboarding.
    Future.delayed(const Duration(milliseconds: 1800), () {
      if (mounted) {
        Navigator.of(context).pushReplacementNamed(AppRoutes.onboarding);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // TEMPORARY DIAGNOSTIC: errorBuilder shows a visible red box +
            // the exact error message if the logo asset fails to load,
            // instead of silently rendering nothing. Remove errorBuilder
            // once the logo is confirmed working.
            Image.asset(
              AppAssets.logo,
              width: 200,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  width: 200,
                  height: 200,
                  color: Colors.red.withOpacity(0.15),
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.broken_image, color: Colors.red, size: 40),
                      const SizedBox(height: 8),
                      Text(
                        'Logo failed to load:\n$error',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.red, fontSize: 11),
                      ),
                    ],
                  ),
                );
              },
            )
                .animate()
                .fadeIn(duration: 600.ms)
                .scale(
              begin: const Offset(0.85, 0.85),
              end: const Offset(1, 1),
              duration: 600.ms,
              curve: Curves.easeOut,
            ),
            const SizedBox(height: 20),
            Text(
              'Your ride, your journey',
              style: AppTextStyles.bodySecondary.copyWith(
                color: colors.textSecondary,
                fontSize: 14,
                letterSpacing: 0.3,
              ),
            ).animate().fadeIn(delay: 300.ms, duration: 600.ms),
          ],
        ),
      ),
    );
  }
}