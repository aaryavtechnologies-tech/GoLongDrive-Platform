import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_text_field.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';

/// Step 1 — Personal details. No icon header on this step (per guide table).
/// Fields: Full Name, Phone, Email, Date of Birth — one card.
class PersonalStep extends StatefulWidget {
  final RegistrationData registration;
  const PersonalStep({super.key, required this.registration});

  @override
  State<PersonalStep> createState() => _PersonalStepState();
}

class _PersonalStepState extends State<PersonalStep> {
  late final _nameController = TextEditingController(text: widget.registration.fullName);
  late final _phoneController = TextEditingController(text: widget.registration.phone);
  late final _emailController = TextEditingController(text: widget.registration.email);
  late final _dobController = TextEditingController(text: widget.registration.dateOfBirth);

  String? _nameError, _phoneError, _emailError, _dobError;

  bool _validate() {
    setState(() {
      _nameError = _nameController.text.trim().isEmpty ? 'Full name is required' : null;
      _phoneError = _phoneController.text.trim().length < 10 ? 'Enter a valid phone number' : null;
      _emailError = !_emailController.text.contains('@') ? 'Enter a valid email' : null;
      _dobController.text.isEmpty
          ? _dobError = 'Date of birth is required'
          : _dobError = null;
    });
    return [_nameError, _phoneError, _emailError, _dobError].every((e) => e == null);
  }

  void _handleNext() {
    if (!_validate()) return;
    widget.registration.update(() {
      widget.registration.fullName = _nameController.text.trim();
      widget.registration.phone = _phoneController.text.trim();
      widget.registration.email = _emailController.text.trim();
      widget.registration.dateOfBirth = _dobController.text.trim();
    });
    widget.registration.nextStep();
    context.pushReplacement('/auth/register/address', extra: widget.registration);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _dobController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RegistrationStepScaffold(
      registration: widget.registration,
      onNext: _handleNext,
      children: [
        AppTextField(
          label: 'Full Name',
          placeholder: 'Enter your full name',
          leftIcon: Icons.person_outline,
          controller: _nameController,
          errorText: _nameError,
        ),
        const SizedBox(height: 20),
        AppTextField(
          label: 'Phone Number',
          placeholder: 'Enter your phone number',
          leftIcon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
          controller: _phoneController,
          errorText: _phoneError,
        ),
        const SizedBox(height: 20),
        AppTextField(
          label: 'Email',
          placeholder: 'Enter your email address',
          leftIcon: Icons.mail_outline,
          keyboardType: TextInputType.emailAddress,
          controller: _emailController,
          errorText: _emailError,
        ),
        const SizedBox(height: 20),
        AppTextField(
          label: 'Date of Birth',
          placeholder: 'DD/MM/YYYY',
          leftIcon: Icons.calendar_today_outlined,
          keyboardType: TextInputType.datetime,
          controller: _dobController,
          errorText: _dobError,
        ),
      ],
    );
  }
}
