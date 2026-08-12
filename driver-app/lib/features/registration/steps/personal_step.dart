import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_text_field.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';
import 'package:flutter/services.dart';

class DateInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    if (newValue.text.length < oldValue.text.length) {
      return newValue;
    }
    final text = newValue.text.replaceAll('/', '');
    final buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      buffer.write(text[i]);
      if ((i == 1 || i == 3) && i != text.length - 1) {
        buffer.write('/');
      }
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

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
      final name = _nameController.text.trim();
      final phone = _phoneController.text.trim();
      final email = _emailController.text.trim();
      final dob = _dobController.text.trim();

      _nameError = name.length < 3 || !RegExp(r'^[a-zA-Z\s]+$').hasMatch(name) ? 'Enter a valid full name' : null;
      _phoneError = phone.length != 10 || !RegExp(r'^[0-9]+$').hasMatch(phone) ? 'Enter a valid 10-digit phone number' : null;
      _emailError = !RegExp(r'^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]+').hasMatch(email) ? 'Enter a valid email' : null;
      
      if (dob.isEmpty) {
        _dobError = 'Date of birth is required';
      } else if (!RegExp(r'^\d{2}/\d{2}/\d{4}$').hasMatch(dob)) {
        _dobError = 'Use DD/MM/YYYY format';
      } else {
        try {
          final parts = dob.split('/');
          final day = int.parse(parts[0]);
          final month = int.parse(parts[1]);
          final year = int.parse(parts[2]);
          final date = DateTime(year, month, day);
          
          if (date.year != year || date.month != month || date.day != day) {
            _dobError = 'Invalid date';
          } else {
            final age = DateTime.now().difference(date).inDays / 365;
            _dobError = age < 18 ? 'Must be at least 18 years old' : null;
          }
        } catch (e) {
          _dobError = 'Invalid date';
        }
      }
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
          maxLength: 10,
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
          maxLength: 10,
          controller: _dobController,
          errorText: _dobError,
          inputFormatters: [DateInputFormatter()],
        ),
      ],
    );
  }
}
