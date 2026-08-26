// lib/screens/splash/splash_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/constants/app_assets.dart';
import '../../routes/app_routes.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/user_scope.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initApp();
  }

  Future<void> _initApp() async {
    // Wait for the splash animation
    await Future.delayed(const Duration(milliseconds: 1800));

    if (!mounted) return;

    final token = await AuthService.getToken();
    debugPrint('📱 [SplashScreen] Auth token present: ${token != null}');

    if (token != null) {
      try {
        if (!mounted) return;
        final userController = UserScope.of(context);
        await userController.fetchProfile();

        if (mounted && userController.isLoggedIn) {
          final profile = userController.userProfile!;
          final isVerified = profile['emailVerified'] == true;
          debugPrint('📱 [SplashScreen] Logged in user: ${profile['email']}, emailVerified: $isVerified');

          if (isVerified) {
            Navigator.of(context).pushReplacementNamed(AppRoutes.home);
          } else {
            Navigator.of(context).pushReplacementNamed(
              AppRoutes.verifyEmail,
              arguments: profile['email'] ?? '',
            );
          }
          return;
        }
      } catch (e) {
        debugPrint('⚠️ [SplashScreen] Error loading user profile: $e. Clearing token.');
        await AuthService.logout();
      }
    }

    if (mounted) {
      Navigator.of(context).pushReplacementNamed(AppRoutes.onboarding);
    }
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
            Image.asset(
              AppAssets.logo,
              width: 200,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  width: 200,
                  height: 200,
                  color: Colors.red.withAlpha(38),
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