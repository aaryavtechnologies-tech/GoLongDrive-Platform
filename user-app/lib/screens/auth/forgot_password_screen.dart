// lib/screens/auth/forgot_password_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../core/utils/app_toast.dart';
import '../../core/data/api_client.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/otp_input.dart';
import '../../widgets/password_field.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/back_button.dart';
import '../../routes/app_routes.dart';

/// Screens 6 + 7 merged — Forgot Password (email entry) and Reset
/// Password (OTP + new password).
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

enum _ForgotPasswordStep { email, resetPassword, success }

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailFormKey = GlobalKey<FormState>();
  final _resetFormKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  _ForgotPasswordStep _step = _ForgotPasswordStep.email;

  String? _otpError;
  int _passwordStrength = 0;
  bool _isSendingOtp = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _onPasswordChanged(String value) {
    setState(() => _passwordStrength = Validators.passwordStrength(value));
  }

  void _handleBack() {
    if (_step == _ForgotPasswordStep.resetPassword) {
      setState(() => _step = _ForgotPasswordStep.email);
    } else {
      _handleBackToLogin();
    }
  }

  void _handleBackToLogin() {
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    } else {
      Navigator.of(context).pushNamedAndRemoveUntil(
        AppRoutes.login,
        (route) => false,
      );
    }
  }

  Future<void> _handleSendOtp() async {
    final formValid = _emailFormKey.currentState?.validate() ?? false;
    if (!formValid) return;

    setState(() => _isSendingOtp = true);

    try {
      final response = await ApiClient.post('/customer/forgot-password', body: {'email': _emailController.text.trim()});

      if (!mounted) return;
      setState(() => _isSendingOtp = false);

      if (response.statusCode == 200) {
        AppToast.showSuccess(context, 'A 6-digit OTP has been sent to your email.');
        setState(() {
          _step = _ForgotPasswordStep.resetPassword;
        });
      } else {
        final errorMsg = jsonDecode(response.body)['message'] ?? 'Failed to send OTP';
        AppToast.showError(context, errorMsg);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSendingOtp = false);
      AppToast.showError(context, 'Network error. Please try again.');
    }
  }

  Future<void> _handleResetPassword() async {
    final otpError = Validators.otp(_otpController.text);
    setState(() => _otpError = otpError);

    final formValid = _resetFormKey.currentState?.validate() ?? false;
    if (otpError != null || !formValid) return;

    setState(() => _isSubmitting = true);

    try {
      final response = await ApiClient.post('/customer/reset-password', body: {
        'email': _emailController.text.trim(),
        'otp': _otpController.text.trim(),
        'newPassword': _newPasswordController.text,
      });

      if (!mounted) return;
      setState(() => _isSubmitting = false);

      if (response.statusCode == 200) {
        setState(() {
          _step = _ForgotPasswordStep.success;
        });
      } else {
        final errorMsg = jsonDecode(response.body)['message'] ?? 'Failed to reset password';
        AppToast.showError(context, errorMsg);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      AppToast.showError(context, 'Network error. Please try again.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _handleBack();
      },
      child: Scaffold(
        backgroundColor: colors.background,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: switch (_step) {
              _ForgotPasswordStep.email => _buildEmailState(),
              _ForgotPasswordStep.resetPassword => _buildResetState(),
              _ForgotPasswordStep.success => _buildSuccessState(),
            },
          ),
        ),
      ),
    );
  }

  Widget _buildEmailState() {
    final colors = AppColors.of(context);
    return Form(
      key: _emailFormKey,
      child: ListView(
        children: [
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerLeft,
            child: AppBackButton(onPressed: _handleBackToLogin),
          ),
          const SizedBox(height: 24),
          Text(
            'Forgot Password?',
            style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary),
          ),
          const SizedBox(height: 8),
          Text(
            'Enter your registered email to receive an OTP.',
            style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
          ),
          const SizedBox(height: 28),

          AppTextField(
            label: 'Email',
            hint: 'Enter your registered email',
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            prefixIcon: Icons.email_outlined,
            validator: Validators.email,
          ),

          const SizedBox(height: 32),

          PrimaryButton(
            label: 'Send OTP',
            isLoading: _isSendingOtp,
            onPressed: _isSendingOtp ? null : _handleSendOtp,
          ),
          const SizedBox(height: 20),

          Center(
            child: GestureDetector(
              onTap: _handleBackToLogin,
              child: Text('Back to Login', style: AppTextStyles.link),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildResetState() {
    final colors = AppColors.of(context);
    return Form(
      key: _resetFormKey,
      child: ListView(
        children: [
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerLeft,
            child: AppBackButton(
              onPressed: () => setState(() => _step = _ForgotPasswordStep.email),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Reset Password',
            style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary),
          ),
          const SizedBox(height: 8),
          Text.rich(
            TextSpan(
              style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
              children: [
                const TextSpan(text: 'Enter the code sent to '),
                TextSpan(
                  text: _emailController.text,
                  style: AppTextStyles.body
                      .copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600),
                ),
                const TextSpan(text: ' and choose a new password.'),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: colors.surfaceSecondary,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colors.inputBorder.withValues(alpha: 0.5)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline, size: 18, color: AppColors.primaryGold),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Please also check your spam/junk folder for the email OTP if you do not see it in your inbox.',
                    style: AppTextStyles.caption.copyWith(
                      color: colors.textSecondary,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text(
            'Verification Code',
            style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary),
          ),
          const SizedBox(height: 12),
          OtpInput(
            controller: _otpController,
            onChanged: (_) {
              if (_otpError != null) setState(() => _otpError = null);
            },
          ),
          if (_otpError != null) ...[
            const SizedBox(height: 12),
            Text(_otpError!, style: AppTextStyles.errorText),
          ],

          const SizedBox(height: 28),

          PasswordField(
            controller: _newPasswordController,
            label: 'New Password',
            onChanged: _onPasswordChanged,
            validator: Validators.password,
            enableStrengthIndicator: true,
            strength: _passwordStrength,
          ),

          const SizedBox(height: 20),

          PasswordField(
            controller: _confirmPasswordController,
            label: 'Confirm Password',
            validator: (value) => Validators.confirmPassword(
              value,
              _newPasswordController.text,
            ),
          ),

          const SizedBox(height: 32),

          PrimaryButton(
            label: 'Reset Password',
            isLoading: _isSubmitting,
            onPressed: _isSubmitting ? null : _handleResetPassword,
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSuccessState() {
    final colors = AppColors.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: 88,
            width: 88,
            decoration: const BoxDecoration(
              color: AppColors.success,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check, color: Colors.white, size: 44),
          ).animate().scale(
            duration: 400.ms,
            curve: Curves.elasticOut,
            begin: const Offset(0.4, 0.4),
            end: const Offset(1, 1),
          ).fadeIn(duration: 250.ms),
          const SizedBox(height: 24),
          Text(
            'Password Changed Successfully',
            textAlign: TextAlign.center,
            style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary),
          ).animate().fadeIn(delay: 200.ms, duration: 300.ms),
          const SizedBox(height: 8),
          Text(
            'You can now log in with your new password.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
          ).animate().fadeIn(delay: 350.ms, duration: 300.ms),
          const SizedBox(height: 32),
          PrimaryButton(
            label: 'Back to Login',
            onPressed: _handleBackToLogin,
          ).animate().fadeIn(delay: 500.ms, duration: 300.ms),
        ],
      ),
    );
  }
}