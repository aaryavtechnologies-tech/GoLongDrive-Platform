// lib/screens/auth/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/password_field.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/app_checkbox.dart';
import '../../routes/app_routes.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/user_scope.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _rememberMe = false;
  bool _isLoading = false;
  String? _authError;

  @override
  void initState() {
    super.initState();
    _loadSavedCredentials();
  }

  Future<void> _loadSavedCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    final savedEmail = prefs.getString('remembered_email');
    final savedPassword = prefs.getString('remembered_password');
    
    if (savedEmail != null && savedPassword != null) {
      setState(() {
        _emailController.text = savedEmail;
        _passwordController.text = savedPassword;
        _rememberMe = true;
      });
    }
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
      if (!mounted) return;

      // Fetch profile immediately after login
      final userController = UserScope.of(context);
      await userController.fetchProfile();

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (userController.isLoggedIn) {
        // Save credentials if remember me is checked
        final prefs = await SharedPreferences.getInstance();
        if (_rememberMe) {
          await prefs.setString('remembered_email', enteredEmail);
          await prefs.setString('remembered_password', enteredPassword);
        } else {
          await prefs.remove('remembered_email');
          await prefs.remove('remembered_password');
        }

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
    Navigator.of(context).pushNamed(AppRoutes.register);
  }

  void _goToForgotPassword() {
    Navigator.of(context).pushNamed(AppRoutes.forgotPassword);
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome back',
                  style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary),
                )
                    .animate()
                    .fadeIn(duration: 400.ms),
                const SizedBox(height: 8),
                Text(
                  'Log in to continue booking your rides.',
                  style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                ).animate().fadeIn(delay: 100.ms, duration: 400.ms),
                const SizedBox(height: 32),

                AppTextField(
                  label: 'Email',
                  hint: 'Enter your email address',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: Icons.email_outlined,
                  validator: Validators.email,
                ),
                const SizedBox(height: 20),

                PasswordField(
                  label: 'Password',
                  hint: 'Enter your password',
                  controller: _passwordController,
                  validator: Validators.passwordRequired,
                ),

                if (_authError != null) ...[
                  const SizedBox(height: 12),
                  Text(_authError!, style: AppTextStyles.errorText),
                ],

                const SizedBox(height: 16),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppCheckbox(
                      value: _rememberMe,
                      onChanged: (v) => setState(() => _rememberMe = v),
                      label: const Text('Remember me'),
                    ),
                    TextButton(
                      onPressed: _goToForgotPassword,
                      child: Text('Forgot password?', style: AppTextStyles.link),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                PrimaryButton(
                  label: 'Log In',
                  isLoading: _isLoading,
                  onPressed: _onLoginPressed,
                ),
                const SizedBox(height: 28),

                Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Don't have an account? ",
                        style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                      ),
                      GestureDetector(
                        onTap: _goToRegister,
                        child: Text('Sign Up', style: AppTextStyles.link),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}