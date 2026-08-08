import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/otp_input.dart';
import '../../core/widgets/screen_header.dart';

/// Matches app/(auth)/otp.tsx — reached from Forgot Password with
/// {'email': String} (or phone) as route arguments. On success, routes to
/// /auth/reset-password with the same arguments plus 'otp'.
class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpKey = GlobalKey<OtpInputState>();
  String _code = '';
  String? _errorText;
  bool _isLoading = false;

  Timer? _resendTimer;
  int _secondsLeft = 30;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    _resendTimer?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    _secondsLeft = 30;
    _resendTimer?.cancel();
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() => _secondsLeft--);
      if (_secondsLeft <= 0) timer.cancel();
    });
  }

  Future<void> _handleResend(String phone) async {
    // TODO: call AuthService.sendOtp(phone) here.
    _otpKey.currentState?.clear();
    setState(() => _errorText = null);
    _startResendTimer();
  }

  Future<void> _handleVerify(Map<String, dynamic>? args) async {
    if (_code.length != 6) {
      setState(() => _errorText = 'Enter the 6-digit code');
      return;
    }
    setState(() {
      _isLoading = true;
      _errorText = null;
    });
    // Verification happens on the next screen for password resets
    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;
    setState(() => _isLoading = false);
    
    final extraArgs = Map<String, dynamic>.from(args ?? {});
    extraArgs['otp'] = _code;
    context.pushReplacement('/auth/reset-password', extra: extraArgs);
  }

  @override
  Widget build(BuildContext context) {
    final args = GoRouterState.of(context).extra as Map<String, dynamic>?;
    final phone = (args?['phone'] as String?) ?? '';
    final email = (args?['email'] as String?) ?? '';
    final identifier = phone.isNotEmpty ? phone : email;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: BackButton(onPressed: () => context.pop()),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 24),
              ScreenHeader(
                title: 'Verify OTP',
                subtitle: identifier.isEmpty
                    ? 'Enter the 6-digit code we sent you.'
                    : 'Enter the 6-digit code sent to $identifier.',
              ),
              const SizedBox(height: 40),
              OtpInput(
                key: _otpKey,
                hasError: _errorText != null,
                onChanged: (code) => setState(() => _code = code),
                onCompleted: (code) => _handleVerify(args),
              ),
              if (_errorText != null) ...[
                const SizedBox(height: 12),
                Text(_errorText!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
              ],
              const SizedBox(height: 32),
              AppButton(
                label: 'Verify',
                onPressed: () => _handleVerify(args),
                isLoading: _isLoading,
              ),
              const SizedBox(height: 20),
              _secondsLeft > 0
                  ? Text(
                      'Resend code in 0:${_secondsLeft.toString().padLeft(2, '0')}',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                    )
                  : TextButton(
                      onPressed: () => _handleResend(identifier),
                      child: const Text(
                        'Resend OTP',
                        style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold),
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
