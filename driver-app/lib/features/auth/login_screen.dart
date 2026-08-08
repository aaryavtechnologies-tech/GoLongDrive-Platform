import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../app/theme.dart';
import '../../core/config/env_config.dart';
import '../../core/data/auth_service.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/app_text_field.dart';
import '../../core/widgets/app_checkbox.dart';

/// Matches app/(auth)/login.tsx — compacted to fit one screen, no scrolling.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = false;
  bool _isLoading = false;

  String? _emailError;
  String? _passwordError;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool _validate() {
    setState(() {
      final emailRegex = RegExp(r'^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]+');
      _emailError = !emailRegex.hasMatch(_emailController.text.trim()) ? 'Enter a valid email address' : null;
      _passwordError = _passwordController.text.length < 8 ? 'Password must be at least 8 characters' : null;
    });
    return _emailError == null && _passwordError == null;
  }

  Future<void> _handleLogin() async {
    if (!_validate()) return;
    setState(() => _isLoading = true);
    
    try {
      final url = Uri.parse('${EnvConfig.apiUrl}/driver/login');
      final requestBody = {
        'email': _emailController.text.trim(),
        'password': _passwordController.text,
      };

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
        final data = jsonDecode(response.body);
        final token = data['data']['accessToken'];
        final userId = data['data']['driver']['id'];
        
        if (token != null) {
          await AuthService.saveToken(token);
          await AuthService.saveUserId(userId);
          if (mounted) context.go('/tabs');
        } else {
          throw Exception('No token received');
        }
      } else {
        final errorMsg = jsonDecode(response.body)['message'] ?? 'Login failed';
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

  void _handleDemoLogin() {
    context.go('/tabs');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight,
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Header — compact, no subtitle.
                      Column(
                        children: [
                          const SizedBox(height: 12),
                          Container(
                            width: 76,
                            height: 76,
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppColors.gold.withOpacity(0.2), width: 2),
                              boxShadow: [
                                BoxShadow(color: AppColors.gold.withOpacity(0.15), blurRadius: 24),
                              ],
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: Image.asset(
                              'assets/images/logo.jpeg',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => ColoredBox(
                                color: AppColors.surface,
                                child: const Icon(Icons.directions_car, color: AppColors.gold, size: 34),
                              ),
                            ),
                          ),
                          Text(
                            'Login',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),

                      // Form — fills the middle, no scroll view.
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          AppTextField(
                            label: 'Email Address',
                            placeholder: 'Enter your email',
                            leftIcon: Icons.email_outlined,
                            keyboardType: TextInputType.emailAddress,
                            controller: _emailController,
                            errorText: _emailError,
                          ),
                          const SizedBox(height: 18),
                          AppTextField(
                            label: 'Password',
                            placeholder: 'Enter your password',
                            leftIcon: Icons.lock_outline,
                            isPassword: true,
                            controller: _passwordController,
                            errorText: _passwordError,
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              AppCheckbox(
                                value: _rememberMe,
                                onChanged: (v) => setState(() => _rememberMe = v),
                                label: Text(
                                  'Remember Me',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                                ),
                              ),
                              TextButton(
                                onPressed: () => context.push('/auth/forgot-password'),
                                style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                                child: const Text(
                                  'Forgot Password?',
                                  style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          AppButton(label: 'Log In', onPressed: _handleLogin, isLoading: _isLoading, height: 52),
                        ],
                      ),

                      // Footer — divider + Apply as New Driver, guaranteed visible.
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            children: [
                              Expanded(child: Divider(color: AppColors.divider)),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: Text('OR', style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
                              ),
                              Expanded(child: Divider(color: AppColors.divider)),
                            ],
                          ),
                          const SizedBox(height: 14),
                          AppButton(
                            label: 'Apply as a New Driver',
                            variant: AppButtonVariant.secondary,
                            rightIcon: Icon(Icons.person_add_alt, color: AppColors.textPrimary, size: 20),
                            onPressed: () => context.push('/auth/register'),
                            height: 52,
                          ),
                          const SizedBox(height: 16),
                          Text.rich(
                            TextSpan(
                              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                              children: [
                                const TextSpan(text: 'By logging in, you agree to our '),
                                TextSpan(
                                  text: 'Terms',
                                  style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600),
                                  recognizer: TapGestureRecognizer()..onTap = () => context.push('/profile/terms'),
                                ),
                                const TextSpan(text: ' and '),
                                TextSpan(
                                  text: 'Privacy Policy',
                                  style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600),
                                  recognizer: TapGestureRecognizer()..onTap = () => context.push('/profile/privacy'),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
