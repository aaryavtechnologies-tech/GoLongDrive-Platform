// lib/screens/auth/register_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/password_field.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/app_checkbox.dart';
import '../../widgets/back_button.dart';
import '../../routes/app_routes.dart';
import '../../core/services/auth_service.dart';
import '../../core/utils/app_toast.dart';

/// Screen 4 — Register
///
/// 2-Step Registration:
/// Step 1: Full name, email, mobile
/// Step 2: Password, confirm password, T&C checkbox
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _step1FormKey = GlobalKey<FormState>();
  final _step2FormKey = GlobalKey<FormState>();

  int _currentStep = 0;

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

  void _handleNext() {
    if (_step1FormKey.currentState?.validate() ?? false) {
      setState(() => _currentStep = 1);
    }
  }

  Future<void> _handleRegister() async {
    final formValid = _step2FormKey.currentState?.validate() ?? false;

    setState(() => _showTermsError = !_agreedToTerms);

    if (!formValid || !_agreedToTerms) return;

    setState(() => _isSubmitting = true);

    try {
      await AuthService.register(
        _fullNameController.text.trim(),
        _emailController.text.trim(),
        _mobileController.text.trim(),
        _passwordController.text,
      );

      // Successfully registered, now send OTP for verification
      await AuthService.sendOtp();

      if (!mounted) return;
      setState(() => _isSubmitting = false);

      Navigator.of(context).pushNamed(
        AppRoutes.verifyEmail,
        arguments: _emailController.text.trim(),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      AppToast.showError(
        context,
        e.toString().replaceFirst('Exception: ', ''),
      );
    }
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

  void _onBackPressed() {
    if (_currentStep == 1) {
      setState(() => _currentStep = 0);
    } else {
      if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      } else {
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutes.login,
          (route) => false,
        );
      }
    }
  }

  Widget _buildStep1() {
    return Form(
      key: _step1FormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
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
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(10),
            ],
          ),
          const SizedBox(height: 28),
          PrimaryButton(
            label: 'Next',
            onPressed: _handleNext,
          ),
        ],
      ),
    );
  }

  Widget _buildStep2(AppColorPalette colors) {
    return Form(
      key: _step2FormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
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
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: PopScope(
        canPop: _currentStep == 0,
        onPopInvokedWithResult: (didPop, result) {
          if (didPop) return;
          setState(() => _currentStep = 0);
        },
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: ListView(
              children: [
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: AppBackButton(onPressed: _onBackPressed),
                ),
                const SizedBox(height: 24),
                Text(
                  _currentStep == 0 ? 'Create Account' : 'Secure Account',
                  style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary),
                ),
                const SizedBox(height: 8),
                Text(
                  _currentStep == 0
                      ? 'Sign up to start booking your rides'
                      : 'Set a password to secure your account',
                  style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                ),
                const SizedBox(height: 32),

                if (_currentStep == 0) _buildStep1() else _buildStep2(colors),

                const SizedBox(height: 20),
                if (_currentStep == 0)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Already have an account? ',
                        style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                      ),
                      GestureDetector(
                        onTap: () {
                          if (Navigator.of(context).canPop()) {
                            Navigator.of(context).pop();
                          } else {
                            Navigator.of(context).pushNamedAndRemoveUntil(
                              AppRoutes.login,
                              (route) => false,
                            );
                          }
                        },
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