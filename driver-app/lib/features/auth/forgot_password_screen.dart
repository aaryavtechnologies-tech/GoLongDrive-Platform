import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../app/theme.dart';
import '../../core/config/env_config.dart';
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
  final _emailController = TextEditingController();
  String? _emailError;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSendResetLink() async {
    final email = _emailController.text.trim();
    debugPrint('>>> BUTTON TAPPED: email="$email"');
    final emailRegex = RegExp(r'^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]+');
    setState(() => _emailError = !emailRegex.hasMatch(email) ? 'Enter a valid email address' : null);
    if (_emailError != null) {
      debugPrint('>>> VALIDATION FAILED: emailError=$_emailError');
      return;
    }

    setState(() => _isLoading = true);
    
    try {
      final url = Uri.parse('${EnvConfig.apiUrl}/driver/forgot-password');
      final requestBody = {'email': email};
      
      debugPrint('>>> API REQUEST: POST $url');
      debugPrint('>>> PAYLOAD: $requestBody');

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      debugPrint('<<< API RESPONSE: ${response.statusCode}');
      debugPrint('<<< BODY: ${response.body}');

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('A 6-digit OTP has been sent to your email.')),
        );
        context.push('/auth/otp', extra: {'email': email});
      } else {
        final errorMsg = jsonDecode(response.body)['message'] ?? 'Failed to send reset link';
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
                subtitle: "Enter your registered email address and we'll send you a link to reset your password.",
              ),
              const SizedBox(height: 40),
              AppTextField(
                label: 'Email Address',
                placeholder: 'Enter your email',
                leftIcon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                controller: _emailController,
                errorText: _emailError,
              ),
              const SizedBox(height: 32),
              AppButton(label: 'Send Reset Link', onPressed: _handleSendResetLink, isLoading: _isLoading),
            ],
          ),
        ),
      ),
    );
  }
}
