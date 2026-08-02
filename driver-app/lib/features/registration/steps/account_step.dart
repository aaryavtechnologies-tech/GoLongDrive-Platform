import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../app/theme.dart';
import '../../../core/config/env_config.dart';
import '../../../core/widgets/app_checkbox.dart';
import '../../../core/widgets/app_text_field.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';

/// Step 3 — Account. Fields: Password, Confirm Password, Accept Terms
/// checkbox. `isNextDisabled` is wired to the terms checkbox, matching the
/// login screen's "Remember Me" AppCheckbox usage.
class AccountStep extends StatefulWidget {
  final RegistrationData registration;
  const AccountStep({super.key, required this.registration});

  @override
  State<AccountStep> createState() => _AccountStepState();
}

class _AccountStepState extends State<AccountStep> {
  late final _passwordController = TextEditingController(text: widget.registration.password);
  late final _confirmController = TextEditingController(text: widget.registration.confirmPassword);
  late bool _acceptedTerms = widget.registration.acceptedTerms;
  bool _isSubmitting = false;

  String? _passwordError, _confirmError;

  bool _validate() {
    setState(() {
      final pwd = _passwordController.text;
      if (pwd.length < 8) {
        _passwordError = 'Password must be at least 8 characters';
      } else if (!RegExp(r'[A-Z]').hasMatch(pwd) || !RegExp(r'[a-z]').hasMatch(pwd) || !RegExp(r'[0-9]').hasMatch(pwd)) {
        _passwordError = 'Include uppercase, lowercase, and number';
      } else if (!RegExp(r'[\W_]').hasMatch(pwd)) {
        _passwordError = 'Include at least one special character';
      } else {
        _passwordError = null;
      }
      _confirmError = _confirmController.text != pwd ? 'Passwords do not match' : null;
      if (!_acceptedTerms) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please accept the Terms and Conditions')));
      }
    });
    return _passwordError == null && _confirmError == null && _acceptedTerms;
  }

  Widget _buildPasswordMeter() {
    final pwd = _passwordController.text;
    if (pwd.isEmpty) return const SizedBox.shrink();

    int strength = 0;
    if (pwd.length >= 8) strength++;
    if (RegExp(r'[A-Z]').hasMatch(pwd) && RegExp(r'[a-z]').hasMatch(pwd)) strength++;
    if (RegExp(r'[0-9]').hasMatch(pwd)) strength++;
    if (RegExp(r'[\W_]').hasMatch(pwd)) strength++;

    Color color;
    String label;
    if (strength <= 1) {
      color = AppColors.error;
      label = 'Weak';
    } else if (strength == 2) {
      color = Colors.orange;
      label = 'Fair';
    } else if (strength == 3) {
      color = Colors.amber;
      label = 'Good';
    } else {
      color = AppColors.success;
      label = 'Strong';
    }

    return Padding(
      padding: const EdgeInsets.only(top: 8.0, bottom: 4.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Password Strength', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: List.generate(4, (index) {
              return Expanded(
                child: Container(
                  height: 4,
                  margin: EdgeInsets.only(right: index < 3 ? 4 : 0),
                  decoration: BoxDecoration(
                    color: index < strength ? color : AppColors.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Future<void> _handleNext() async {
    if (!_validate()) return;
    
    // Save locally
    widget.registration.update(() {
      widget.registration.password = _passwordController.text;
      widget.registration.confirmPassword = _confirmController.text;
      widget.registration.acceptedTerms = _acceptedTerms;
    });

    // If already registered in this session, skip API call
    if (widget.registration.jwtToken != null) {
      widget.registration.nextStep();
      context.pushReplacement('/auth/register/vehicle-basic', extra: widget.registration);
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final url = Uri.parse('${EnvConfig.apiUrl}/driver/register');
      final requestBody = {
        'fullName': widget.registration.fullName,
        'email': widget.registration.email,
        'phoneNumber': widget.registration.phone,
        'password': widget.registration.password,
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
      setState(() => _isSubmitting = false);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        widget.registration.jwtToken = data['data']['accessToken'];
        
        widget.registration.nextStep();
        context.pushReplacement('/auth/register/vehicle-basic', extra: widget.registration);
      } else {
        final errorData = jsonDecode(response.body);
        final errorMsg = errorData['message'] ?? 'Registration failed';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $errorMsg')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error. Please try again.')),
      );
    }
  }

  void _handleBack() {
    widget.registration.previousStep();
    context.pushReplacement('/auth/register/address', extra: widget.registration);
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RegistrationStepScaffold(
      registration: widget.registration,
      onNext: _handleNext,
      onBack: _handleBack,
      isNextDisabled: !_acceptedTerms,
      isNextLoading: _isSubmitting,
      children: [
        AppTextField(
          label: 'Password',
          placeholder: 'Create a password',
          leftIcon: Icons.lock_outline,
          isPassword: true,
          controller: _passwordController,
          errorText: _passwordError,
          onChanged: (_) => setState(() {}),
        ),
        _buildPasswordMeter(),
        const SizedBox(height: 12),
        AppTextField(
          label: 'Confirm Password',
          placeholder: 'Re-enter your password',
          leftIcon: Icons.lock_outline,
          isPassword: true,
          controller: _confirmController,
          errorText: _confirmError,
        ),
        const SizedBox(height: 24),
        AppCheckbox(
          value: _acceptedTerms,
          onChanged: (v) => setState(() => _acceptedTerms = v),
          label: Text.rich(
            TextSpan(
              text: 'I agree to the ',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
              children: [
                TextSpan(
                  text: 'Terms of Service',
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
        ),
      ],
    );
  }
}
