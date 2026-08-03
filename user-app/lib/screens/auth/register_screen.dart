// lib/screens/auth/register_screen.dart
import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/password_field.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/app_checkbox.dart';
import '../../widgets/back_button.dart';
import '../../routes/app_routes.dart';

/// Screen 4 — Register
///
/// Full name, email, mobile, password, confirm password, T&C checkbox,
/// and a live password-strength meter driven by [Validators.passwordStrength].
/// On successful (mock) submit, navigates to [VerifyEmailScreen].
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _mobileController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _agreedToTerms = false;
  bool _showTermsError = false;
  bool _isSubmitting = false;
  int _passwordStrength = 0;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _onPasswordChanged(String value) {
    setState(() {
      _passwordStrength = Validators.passwordStrength(value);
    });
  }

  Future<void> _handleRegister() async {
    final formValid = _formKey.currentState?.validate() ?? false;

    setState(() => _showTermsError = !_agreedToTerms);

    if (!formValid || !_agreedToTerms) return;

    setState(() => _isSubmitting = true);

    // Mock registration call — replace with real API integration later.
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    setState(() => _isSubmitting = false);

    Navigator.of(context).pushNamed(
      AppRoutes.verifyEmail,
      arguments: _emailController.text.trim(),
    );
  }

  Color _strengthColor(int strength) {
    switch (strength) {
      case 0:
      case 1:
        return AppColors.error;
      case 2:
        return AppColors.warning;
      case 3:
        return AppColors.primaryGold;
      case 4:
      default:
        return AppColors.success;
    }
  }

  String _strengthLabel(int strength) {
    switch (strength) {
      case 0:
        return '';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
      default:
        return 'Strong';
    }
  }

  Widget _buildStrengthMeter(AppColorPalette colors) {
    if (_passwordController.text.isEmpty) return const SizedBox.shrink();

    final color = _strengthColor(_passwordStrength);

    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(4, (index) {
              final filled = index < _passwordStrength;
              return Expanded(
                child: Container(
                  margin: EdgeInsets.only(right: index == 3 ? 0 : 6),
                  height: 4,
                  decoration: BoxDecoration(
                    // Unfilled track: divider reads as a muted line in both
                    // modes (dark-mode nearBlack was the same idea — a
                    // subtle track, not a card surface).
                    color: filled ? color : colors.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 6),
          Text(
            _strengthLabel(_passwordStrength),
            style: AppTextStyles.caption.copyWith(color: color),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                const SizedBox(height: 8),
                AppBackButton(onPressed: () => Navigator.of(context).pop()),
                const SizedBox(height: 24),
                Text(
                  'Create Account',
                  style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary),
                ),
                const SizedBox(height: 8),
                Text(
                  'Sign up to start booking your rides',
                  style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                ),
                const SizedBox(height: 32),

                AppTextField(
                  label: 'Full Name',
                  controller: _fullNameController,
                  hint: 'Enter your full name',
                  validator: Validators.fullName,
                  prefixIcon: Icons.person_outline,
                ),
                const SizedBox(height: 16),

                AppTextField(
                  label: 'Email',
                  controller: _emailController,
                  hint: 'Enter your email',
                  keyboardType: TextInputType.emailAddress,
                  validator: Validators.email,
                  prefixIcon: Icons.email_outlined,
                ),
                const SizedBox(height: 16),

                AppTextField(
                  label: 'Mobile Number',
                  controller: _mobileController,
                  hint: 'Enter your 10-digit mobile number',
                  keyboardType: TextInputType.phone,
                  validator: Validators.mobile,
                  prefixIcon: Icons.phone_outlined,
                ),
                const SizedBox(height: 16),

                PasswordField(
                  label: 'Password',
                  controller: _passwordController,
                  hint: 'Create a password',
                  validator: Validators.password,
                  onChanged: _onPasswordChanged,
                ),
                _buildStrengthMeter(colors),
                const SizedBox(height: 16),

                PasswordField(
                  label: 'Confirm Password',
                  controller: _confirmPasswordController,
                  hint: 'Re-enter your password',
                  validator: (value) => Validators.confirmPassword(
                    value,
                    _passwordController.text,
                  ),
                ),
                const SizedBox(height: 20),

                AppCheckbox(
                  value: _agreedToTerms,
                  onChanged: (value) {
                    setState(() {
                      _agreedToTerms = value;
                      if (_agreedToTerms) _showTermsError = false;
                    });
                  },
                  label: Text.rich(
                    TextSpan(
                      children: [
                        const TextSpan(text: 'I agree to the '),
                        TextSpan(text: 'Terms & Conditions', style: AppTextStyles.link),
                        const TextSpan(text: ' and '),
                        TextSpan(text: 'Privacy Policy', style: AppTextStyles.link),
                      ],
                    ),
                  ),
                ),
                if (_showTermsError)
                  Padding(
                    padding: const EdgeInsets.only(top: 6, left: 4),
                    child: Text(
                      'You must accept the terms to continue',
                      style: AppTextStyles.errorText,
                    ),
                  ),

                const SizedBox(height: 28),

                PrimaryButton(
                  label: 'Register',
                  isLoading: _isSubmitting,
                  onPressed: _handleRegister,
                ),
                const SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Already have an account? ',
                      style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.of(context).pop(),
                      child: Text('Log In', style: AppTextStyles.link),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}