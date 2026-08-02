import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/select_field.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';

const _indianStates = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

/// Step 2 — Address. Fields: Street, City, State (SelectField, per Phase 2
/// decision — see PROJECT_STATUS.md §6), Pincode.
class AddressStep extends StatefulWidget {
  final RegistrationData registration;
  const AddressStep({super.key, required this.registration});

  @override
  State<AddressStep> createState() => _AddressStepState();
}

class _AddressStepState extends State<AddressStep> {
  late final _streetController = TextEditingController(text: widget.registration.street);
  late final _cityController = TextEditingController(text: widget.registration.city);
  late final _pincodeController = TextEditingController(text: widget.registration.pincode);
  String? _state;

  String? _streetError, _cityError, _stateError, _pincodeError;

  @override
  void initState() {
    super.initState();
    _state = widget.registration.state.isEmpty ? null : widget.registration.state;
  }

  bool _validate() {
    setState(() {
      _streetError = _streetController.text.trim().length < 3 ? 'Street address must be at least 3 characters' : null;
      _cityError = _cityController.text.trim().length < 3 ? 'City must be at least 3 characters' : null;
      _stateError = _state == null ? 'Please select a state' : null;
      final pincode = _pincodeController.text.trim();
      _pincodeError = pincode.length != 6 || !RegExp(r'^[0-9]+$').hasMatch(pincode) ? 'Enter a valid 6-digit pincode' : null;
    });
    return [_streetError, _cityError, _stateError, _pincodeError].every((e) => e == null);
  }

  void _handleNext() {
    if (!_validate()) return;
    widget.registration.update(() {
      widget.registration.street = _streetController.text.trim();
      widget.registration.city = _cityController.text.trim();
      widget.registration.state = _state!;
      widget.registration.pincode = _pincodeController.text.trim();
    });
    widget.registration.nextStep();
    context.pushReplacement('/auth/register/account', extra: widget.registration);
  }

  void _handleBack() {
    widget.registration.previousStep();
    context.pushReplacement('/auth/register', extra: widget.registration);
  }

  @override
  void dispose() {
    _streetController.dispose();
    _cityController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RegistrationStepScaffold(
      registration: widget.registration,
      onNext: _handleNext,
      onBack: _handleBack,
      children: [
        AppTextField(
          label: 'Street Address',
          placeholder: 'House no., street, locality',
          leftIcon: Icons.home_outlined,
          controller: _streetController,
          errorText: _streetError,
        ),
        const SizedBox(height: 20),
        AppTextField(
          label: 'City',
          placeholder: 'Enter your city',
          leftIcon: Icons.location_city_outlined,
          controller: _cityController,
          errorText: _cityError,
        ),
        const SizedBox(height: 20),
        SelectField(
          label: 'State',
          value: _state,
          placeholder: 'Select your state',
          leftIcon: Icons.map_outlined,
          options: _indianStates,
          errorText: _stateError,
          onChanged: (v) => setState(() => _state = v),
        ),
        const SizedBox(height: 20),
        AppTextField(
          label: 'Pincode',
          placeholder: '6-digit pincode',
          leftIcon: Icons.pin_drop_outlined,
          keyboardType: TextInputType.number,
          maxLength: 6,
          controller: _pincodeController,
          errorText: _pincodeError,
        ),
      ],
    );
  }
}
