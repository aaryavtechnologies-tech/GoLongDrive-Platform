import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/select_field.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';

const _vehicleTypes = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury'];

/// Step 4 — Vehicle basic info. Fields: Brand, Model, Registration Number,
/// Vehicle Type (SelectField, per Phase 2 decision).
class VehicleBasicStep extends StatefulWidget {
  final RegistrationData registration;
  const VehicleBasicStep({super.key, required this.registration});

  @override
  State<VehicleBasicStep> createState() => _VehicleBasicStepState();
}

class _VehicleBasicStepState extends State<VehicleBasicStep> {
  late final _brandController = TextEditingController(text: widget.registration.vehicleBrand);
  late final _modelController = TextEditingController(text: widget.registration.vehicleModel);
  late final _regController =
      TextEditingController(text: widget.registration.registrationNumber);
  String? _vehicleType;

  String? _brandError, _modelError, _regError, _typeError;

  @override
  void initState() {
    super.initState();
    _vehicleType = widget.registration.vehicleType.isEmpty ? null : widget.registration.vehicleType;
  }

  bool _validate() {
    setState(() {
      _brandError = _brandController.text.trim().length < 2 ? 'Enter a valid vehicle brand' : null;
      _modelError = _modelController.text.trim().length < 2 ? 'Enter a valid vehicle model' : null;
      final regNum = _regController.text.trim().toUpperCase();
      _regError = regNum.length < 8 || !RegExp(r'^[A-Z0-9\s]+$').hasMatch(regNum) ? 'Enter a valid registration number (e.g. MH 12 AB 1234)' : null;
      _typeError = _vehicleType == null ? 'Please select a vehicle type' : null;
    });
    return [_brandError, _modelError, _regError, _typeError].every((e) => e == null);
  }

  void _handleNext() {
    if (!_validate()) return;
    widget.registration.update(() {
      widget.registration.vehicleBrand = _brandController.text.trim();
      widget.registration.vehicleModel = _modelController.text.trim();
      widget.registration.registrationNumber = _regController.text.trim().toUpperCase();
      widget.registration.vehicleType = _vehicleType!;
    });
    widget.registration.nextStep();
    context.pushReplacement('/auth/register/vehicle-specs', extra: widget.registration);
  }

  void _handleBack() {
    widget.registration.previousStep();
    context.pushReplacement('/auth/register/account', extra: widget.registration);
  }

  @override
  void dispose() {
    _brandController.dispose();
    _modelController.dispose();
    _regController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RegistrationStepScaffold(
      registration: widget.registration,
      onNext: _handleNext,
      onBack: _handleBack,
      headerIcon: Icons.directions_car_outlined,
      headerTitle: 'Vehicle Details',
      headerSubtitle: 'Tell us about the vehicle you\u2019ll be driving',
      children: [
        AppTextField(
          label: 'Vehicle Brand',
          placeholder: 'e.g. Toyota',
          leftIcon: Icons.factory_outlined,
          controller: _brandController,
          errorText: _brandError,
        ),
        const SizedBox(height: 20),
        AppTextField(
          label: 'Vehicle Model',
          placeholder: 'e.g. Innova Crysta',
          leftIcon: Icons.directions_car_outlined,
          controller: _modelController,
          errorText: _modelError,
        ),
        const SizedBox(height: 20),
        AppTextField(
          label: 'Registration Number',
          placeholder: 'e.g. KA 01 AB 1234',
          leftIcon: Icons.confirmation_number_outlined,
          textCapitalization: TextCapitalization.characters,
          controller: _regController,
          errorText: _regError,
        ),
        const SizedBox(height: 20),
        SelectField(
          label: 'Vehicle Type',
          value: _vehicleType,
          placeholder: 'Select vehicle type',
          leftIcon: Icons.category_outlined,
          options: _vehicleTypes,
          errorText: _typeError,
          onChanged: (v) => setState(() => _vehicleType = v),
        ),
      ],
    );
  }
}
