import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../app/theme.dart';
import '../../core/config/env_config.dart';
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

  Future<void> _handleReset(String email, String otp) async {
    if (!_validate()) return;
    setState(() => _isLoading = true);
    
    try {
      final url = Uri.parse('${EnvConfig.apiUrl}/driver/reset-password');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'otp': otp,
          'newPassword': _passwordController.text,
        }),
      );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password reset successfully. Please log in with your new password.')),
        );
        context.go('/login');
      } else {
        final errorMsg = jsonDecode(response.body)['message'] ?? 'Failed to reset password';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMsg)),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error. Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final args = GoRouterState.of(context).extra as Map<String, dynamic>?;
    final email = (args?['email'] as String?) ?? '';
    final otp = (args?['otp'] as String?) ?? '';

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
                onPressed: () => _handleReset(email, otp),
                isLoading: _isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
