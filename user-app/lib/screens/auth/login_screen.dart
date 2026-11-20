// lib/screens/auth/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/app_assets.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/app_checkbox.dart';
import '../../widgets/password_field.dart';
import '../../widgets/primary_button.dart';
import '../../routes/app_routes.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/user_scope.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  static const _storage = FlutterSecureStorage();
  static const _emailKey = 'rider_saved_login_email';
  static const _passwordKey = 'rider_saved_login_password';
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _rememberLogin = false;
  String? _authError;

  @override
  void initState() {
    super.initState();
    _restoreSavedLogin();
  }

  Future<void> _restoreSavedLogin() async {
    final values = await Future.wait([
      _storage.read(key: _emailKey),
      _storage.read(key: _passwordKey),
    ]);
    if (!mounted || values.first == null || values.last == null) return;
    setState(() {
      _emailController.text = values.first!;
      _passwordController.text = values.last!;
      _rememberLogin = true;
    });
  }

  Future<void> _persistLoginChoice() async {
    if (_rememberLogin) {
      await _storage.write(key: _emailKey, value: _emailController.text.trim());
      await _storage.write(key: _passwordKey, value: _passwordController.text);
      return;
    }
    await Future.wait([
      _storage.delete(key: _emailKey),
      _storage.delete(key: _passwordKey),
    ]);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onLoginPressed() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _authError = null);

    final enteredEmail = _emailController.text.trim();
    final enteredPassword = _passwordController.text;

    setState(() => _isLoading = true);

    try {
      await AuthService.login(enteredEmail, enteredPassword);
      await _persistLoginChoice();
      if (!mounted) return;

      // Fetch profile immediately after login
      final userController = UserScope.of(context);
      await userController.fetchProfile();

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (userController.isLoggedIn) {
        final profile = userController.userProfile!;
        final isVerified = profile['emailVerified'] == true;

        if (isVerified) {
          Navigator.of(context).pushReplacementNamed(AppRoutes.home);
        } else {
          // If not verified, send to verification screen
          await AuthService.sendOtp(); // Trigger a new OTP
          if (!mounted) return;
          Navigator.of(context).pushNamed(
            AppRoutes.verifyEmail,
            arguments: profile['email'],
          );
        }
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _authError = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  void _goToRegister() {
    HapticFeedback.lightImpact();
    Navigator.of(context).pushNamed(AppRoutes.register);
  }

  void _goToForgotPassword() {
    HapticFeedback.lightImpact();
    Navigator.of(context).pushNamed(AppRoutes.forgotPassword);
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Brand Header Badge & Logo
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      height: 56,
                      width: 56,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFFEEEEEE),
                          width: 1.2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primaryYellow.withValues(alpha: 0.22),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.asset(
                          AppAssets.logo,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Icon(
                            Icons.directions_car_filled_rounded,
                            color: AppColors.primaryYellow,
                            size: 28,
                          ),
                        ),
                      ),
                    ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primaryYellow.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: AppColors.primaryYellow.withValues(alpha: 0.4),
                          width: 1.0,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: AppColors.primaryYellow,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'GO LONG DRIVE',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(duration: 400.ms),
                  ],
                ),
                const SizedBox(height: 28),

                // Welcome Typography
                Text(
                  'Welcome back',
                  style: AppTextStyles.largeHeading.copyWith(
                    color: colors.textPrimary,
                    fontSize: 30,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.8,
                  ),
                ).animate().fadeIn(duration: 400.ms).slideX(begin: -0.05, end: 0),
                const SizedBox(height: 6),
                Text(
                  'Log in to continue booking and tracking your rides.',
                  style: AppTextStyles.bodySecondary.copyWith(
                    color: colors.textSecondary,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ).animate().fadeIn(delay: 100.ms, duration: 400.ms),
                const SizedBox(height: 28),

                // Elevated Form Card
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: colors.surfaceCard,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: const Color(0xFFEEEEEE),
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                      BoxShadow(
                        color: AppColors.primaryYellow.withValues(alpha: 0.08),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppTextField(
                        label: 'Email',
                        hint: 'Enter your email address',
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: Icons.email_outlined,
                        validator: Validators.email,
                      ),
                      const SizedBox(height: 18),
                      PasswordField(
                        label: 'Password',
                        hint: 'Enter your password',
                        controller: _passwordController,
                        validator: Validators.passwordRequired,
                      ),

                      // Auth error banner
                      if (_authError != null) ...[
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppColors.error.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: AppColors.error.withValues(alpha: 0.25),
                              width: 1.0,
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline_rounded,
                                  color: AppColors.error, size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _authError!,
                                  style: AppTextStyles.errorText.copyWith(
                                    fontWeight: FontWeight.w500,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 16),

                      // Remember login & Forgot password
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          AppCheckbox(
                            value: _rememberLogin,
                            onChanged: (value) =>
                                setState(() => _rememberLogin = value),
                            label: Text(
                              'Save login',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: colors.textPrimary,
                              ),
                            ),
                            isExpanded: false,
                          ),
                          TextButton(
                            onPressed: _goToForgotPassword,
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Text(
                              'Forgot password?',
                              style: AppTextStyles.link.copyWith(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Primary CTA
                      PrimaryButton(
                        label: 'Log In',
                        isLoading: _isLoading,
                        onPressed: _onLoginPressed,
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 150.ms, duration: 400.ms).slideY(begin: 0.05, end: 0),

                const SizedBox(height: 24),

                // Trust & Security Indicator
                Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.shield_outlined,
                        size: 15,
                        color: colors.textSecondary.withValues(alpha: 0.8),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '256-Bit SSL Encrypted & Verified Rides',
                        style: AppTextStyles.caption.copyWith(
                          color: colors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // Register Link Footer
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.inputBackground,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFEEEEEE)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Don't have an account? ",
                          style: AppTextStyles.bodySecondary.copyWith(
                            color: colors.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                        GestureDetector(
                          onTap: _goToRegister,
                          child: Text(
                            'Sign Up',
                            style: AppTextStyles.link.copyWith(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ).animate().fadeIn(delay: 250.ms, duration: 350.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
