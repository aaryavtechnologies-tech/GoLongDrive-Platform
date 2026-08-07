// lib/screens/auth/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../core/constants/app_assets.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/password_field.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/app_checkbox.dart';
import '../../widgets/app_divider.dart';
import '../../widgets/social_login_button.dart';
import '../../routes/app_routes.dart';
import '../../core/services/auth_service.dart';

/// Screen 3 from the checklist. Username, password (+eye toggle), remember me,
/// forgot password, Google login, error/empty states. Mock navigation only —
/// no backend calls. Replace TODOs with named routes once app_routes.dart exists.
///
/// DUMMY TEST CREDENTIALS (mock-auth only, no backend):
///   username: gocabs
///   password: 1234
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  static const String _dummyUsername = 'gocabs';
  static const String _dummyPassword = '1234';

  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _rememberMe = false;
  bool _isLoading = false;
  String? _authError;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String? _requiredValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Username is required';
    }
    return null;
  }

  void _onLoginPressed() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _authError = null);

    final enteredUsername = _usernameController.text.trim();
    final enteredPassword = _passwordController.text;

    setState(() => _isLoading = true);

    try {
      await AuthService.login(enteredUsername, enteredPassword);
      if (!mounted) return;
      setState(() => _isLoading = false);
      Navigator.of(context).pushReplacementNamed(AppRoutes.home);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _authError = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  void _onGoogleLoginPressed() {
    // TODO: mock only — replace with real Google Sign-In once backend is wired.
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Google login tapped — backend integration pending')),
    );
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
                  label: 'Username',
                  hint: 'Enter your username',
                  controller: _usernameController,
                  keyboardType: TextInputType.text,
                  prefixIcon: Icons.person_outline,
                  validator: _requiredValidator,
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

                const AppDivider(),
                const SizedBox(height: 20),

                SocialLoginButton(
                  label: 'Continue with Google',
                  icon: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Image.asset(
                      AppAssets.googleLogo,
                      width: 18,
                      height: 18,
                    ),
                  ),
                  onPressed: _onGoogleLoginPressed,
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