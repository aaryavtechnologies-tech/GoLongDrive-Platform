// lib/screens/auth/verify_email_screen.dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../widgets/otp_input.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/loading_button.dart';
import '../../widgets/back_button.dart';
import '../../routes/app_routes.dart';

/// Screen 5 — Verify Email (OTP)
///
/// 6-digit OTP entry via [OtpInput], a 00:30 resend countdown, a "Change
/// Email" link back to Register, and a success animation before landing
/// on Login. UI-only — verification and resend are both mocked locally.
class VerifyEmailScreen extends StatefulWidget {
  final String email;

  const VerifyEmailScreen({super.key, required this.email});

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  static const int _resendSeconds = 30;

  final _otpController = TextEditingController();

  Timer? _timer;
  int _secondsLeft = _resendSeconds;

  String? _errorText;
  bool _isVerifying = false;
  bool _isResending = false;
  bool _verified = false;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _timer?.cancel();
    setState(() => _secondsLeft = _resendSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft <= 1) {
        timer.cancel();
        setState(() => _secondsLeft = 0);
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  String get _formattedCountdown {
    final minutes = (_secondsLeft ~/ 60).toString().padLeft(2, '0');
    final seconds = (_secondsLeft % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  Future<void> _handleVerify([String? completedValue]) async {
    final value = completedValue ?? _otpController.text;
    final error = Validators.otp(value);

    setState(() => _errorText = error);
    if (error != null) return;

    setState(() => _isVerifying = true);

    // Mock verification call — replace with real API integration later.
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    setState(() {
      _isVerifying = false;
      _verified = true;
    });

    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    Navigator.of(context).pushNamedAndRemoveUntil(
      AppRoutes.login,
          (route) => false,
    );
  }

  Future<void> _handleResend() async {
    if (_secondsLeft > 0 || _isResending) return;

    setState(() => _isResending = true);

    // Mock resend call — replace with real API integration later.
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    setState(() => _isResending = false);
    _startCountdown();
  }

  void _handleChangeEmail() {
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: _verified ? _buildSuccessState() : _buildVerifyState(),
        ),
      ),
    );
  }

  Widget _buildVerifyState() {
    final colors = AppColors.of(context);
    return ListView(
      children: [
        const SizedBox(height: 8),
        AppBackButton(onPressed: () => Navigator.of(context).pop()),
        const SizedBox(height: 24),
        Text(
          'Verify Your Email',
          style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary),
        ),
        const SizedBox(height: 8),
        Text.rich(
          TextSpan(
            style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
            children: [
              const TextSpan(text: 'We sent a 6-digit code to '),
              TextSpan(
                text: widget.email,
                style: AppTextStyles.body
                    .copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),

        OtpInput(
          controller: _otpController,
          onChanged: (_) {
            if (_errorText != null) setState(() => _errorText = null);
          },
          onCompleted: (value) => _handleVerify(value),
        ),
        if (_errorText != null) ...[
          const SizedBox(height: 12),
          Text(_errorText!, style: AppTextStyles.errorText),
        ],

        const SizedBox(height: 28),

        PrimaryButton(
          label: 'Verify',
          isLoading: _isVerifying,
          onPressed: _isVerifying ? null : () => _handleVerify(),
        ),
        const SizedBox(height: 20),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              "Didn't get the code? ",
              style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
            ),
            _secondsLeft > 0
                ? Text(
              'Resend in $_formattedCountdown',
              style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
            )
                : LoadingButton(
              label: 'Resend OTP',
              isLoading: _isResending,
              onPressed: _handleResend,
            ),
          ],
        ),
        const SizedBox(height: 12),

        Center(
          child: GestureDetector(
            onTap: _handleChangeEmail,
            child: Text('Change Email', style: AppTextStyles.link),
          ),
        ),
        const SizedBox(height: 24),
      ],
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
            'Email Verified!',
            style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary),
          ).animate().fadeIn(delay: 200.ms, duration: 300.ms),
          const SizedBox(height: 8),
          Text(
            'Taking you to login...',
            style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
          ).animate().fadeIn(delay: 350.ms, duration: 300.ms),
        ],
      ),
    );
  }
}