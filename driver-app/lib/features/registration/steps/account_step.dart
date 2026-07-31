import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme.dart';
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

  String? _passwordError, _confirmError;

  bool _validate() {
    setState(() {
      _passwordError =
          _passwordController.text.length < 6 ? 'Password must be at least 6 characters' : null;
      _confirmError = _confirmController.text != _passwordController.text ? 'Passwords do not match' : null;
    });
    return _passwordError == null && _confirmError == null && _acceptedTerms;
  }

  void _handleNext() {
    if (!_validate()) return;
    widget.registration.update(() {
      widget.registration.password = _passwordController.text;
      widget.registration.confirmPassword = _confirmController.text;
      widget.registration.acceptedTerms = _acceptedTerms;
    });
    widget.registration.nextStep();
    context.pushReplacement('/auth/register/vehicle-basic', extra: widget.registration);
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
      children: [
        AppTextField(
          label: 'Password',
          placeholder: 'Create a password',
          leftIcon: Icons.lock_outline,
          isPassword: true,
          controller: _passwordController,
          errorText: _passwordError,
        ),
        const SizedBox(height: 20),
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
                TextSpan(text: 'Terms of Service', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600)),
                TextSpan(text: ' and '),
                TextSpan(text: 'Privacy Policy', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
