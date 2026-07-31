import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/app_text_field.dart';
import '../../core/widgets/screen_header.dart';

/// Matches app/(auth)/forgot-password.tsx (§5.4):
/// ScreenHeader + phone field + "Send OTP" -> routes to /auth/otp?phone=...
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _phoneController = TextEditingController();
  String? _phoneError;
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleSendOtp() async {
    final phone = _phoneController.text.trim();
    setState(() => _phoneError = phone.length < 10 ? 'Enter a valid phone number' : null);
    if (_phoneError != null) return;

    setState(() => _isLoading = true);
    // TODO: call AuthService.sendOtp(phone) here.
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() => _isLoading = false);
    context.push('/auth/otp', extra: {'phone': phone});
  }

  @override
  Widget build(BuildContext context) {
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
              const ScreenHeader(
                title: 'Reset Password',
                subtitle: "Enter your registered phone number and we'll send you a one-time code to reset your password.",
              ),
              const SizedBox(height: 40),
              AppTextField(
                label: 'Phone Number',
                placeholder: 'Enter your phone number',
                leftIcon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                controller: _phoneController,
                errorText: _phoneError,
              ),
              const SizedBox(height: 32),
              AppButton(label: 'Send OTP', onPressed: _handleSendOtp, isLoading: _isLoading),
            ],
          ),
        ),
      ),
    );
  }
}
