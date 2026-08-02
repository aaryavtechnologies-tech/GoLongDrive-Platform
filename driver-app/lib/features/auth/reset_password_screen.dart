import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/app_text_field.dart';
import '../../core/widgets/screen_header.dart';

/// Matches app/(auth)/reset-password.tsx — reached from OTP Verify with
/// {'phone': String} as route arguments. On success, routes back to Login.
class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  String? _passwordError;
  String? _confirmError;
  bool _isLoading = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  bool _validate() {
    setState(() {
      final pwd = _passwordController.text;
      if (pwd.length < 8) {
        _passwordError = 'Password must be at least 8 characters';
      } else if (!RegExp(r'[A-Z]').hasMatch(pwd) || !RegExp(r'[a-z]').hasMatch(pwd) || !RegExp(r'[0-9]').hasMatch(pwd)) {
        _passwordError = 'Include uppercase, lowercase, and number';
      } else {
        _passwordError = null;
      }
      _confirmError = _confirmController.text != pwd ? 'Passwords do not match' : null;
    });
    return _passwordError == null && _confirmError == null;
  }

  Future<void> _handleReset(String phone) async {
    if (!_validate()) return;
    setState(() => _isLoading = true);
    // TODO: call AuthService.resetPassword(phone, _passwordController.text) here.
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() => _isLoading = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Password reset. Please log in with your new password.')),
    );
    context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final args = GoRouterState.of(context).extra as Map<String, dynamic>?;
    final phone = (args?['phone'] as String?) ?? '';

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
                title: 'Set New Password',
                subtitle: 'Your new password must be different from previously used passwords.',
              ),
              const SizedBox(height: 40),
              AppTextField(
                label: 'New Password',
                placeholder: 'Enter your new password',
                leftIcon: Icons.lock_outline,
                isPassword: true,
                controller: _passwordController,
                errorText: _passwordError,
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'Confirm Password',
                placeholder: 'Re-enter your new password',
                leftIcon: Icons.lock_outline,
                isPassword: true,
                controller: _confirmController,
                errorText: _confirmError,
              ),
              const SizedBox(height: 32),
              AppButton(
                label: 'Reset Password',
                onPressed: () => _handleReset(phone),
                isLoading: _isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
