import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
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
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = false;
  bool _isLoading = false;

  String? _phoneError;
  String? _passwordError;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool _validate() {
    setState(() {
      _phoneError = _phoneController.text.trim().length < 10 ? 'Enter a valid phone number' : null;
      _passwordError = _passwordController.text.length < 6 ? 'Password must be at least 6 characters' : null;
    });
    return _phoneError == null && _passwordError == null;
  }

  Future<void> _handleLogin() async {
    if (!_validate()) return;
    setState(() => _isLoading = true);
    // TODO: call AuthService / API here.
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    setState(() => _isLoading = false);
    context.go('/tabs');
  }

  void _handleDemoLogin() {
    context.go('/tabs');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
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
                    label: 'Phone Number',
                    placeholder: 'Enter your phone number',
                    leftIcon: Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                    controller: _phoneController,
                    errorText: _phoneError,
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
                  const SizedBox(height: 10),
                  AppButton(
                    label: 'Demo Login (Bypass Backend)',
                    variant: AppButtonVariant.outline,
                    onPressed: _handleDemoLogin,
                    height: 52,
                  ),
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
                  const SizedBox(height: 12),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
