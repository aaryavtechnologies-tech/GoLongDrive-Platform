import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/select_field.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';

const _fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric'];
const _seatingOptions = ['4', '5', '6', '7', '8'];
const _yesNo = ['Yes', 'No'];

/// Step 5 — Vehicle specs. Fields: Fuel Type, Manufacturing Year, Seating
/// Capacity, AC Available — all SelectField except Manufacturing Year
/// (free-entry year, matches Personal step's DOB text-field pattern).
class VehicleSpecsStep extends StatefulWidget {
  final RegistrationData registration;
  const VehicleSpecsStep({super.key, required this.registration});

  @override
  State<VehicleSpecsStep> createState() => _VehicleSpecsStepState();
}

class _VehicleSpecsStepState extends State<VehicleSpecsStep> {
  late final _yearController =
      TextEditingController(text: widget.registration.manufacturingYear);
  String? _fuelType, _seatingCapacity, _acAvailable;

  String? _fuelError, _yearError, _seatingError, _acError;

  @override
  void initState() {
    super.initState();
    _fuelType = widget.registration.fuelType.isEmpty ? null : widget.registration.fuelType;
    _seatingCapacity =
        widget.registration.seatingCapacity.isEmpty ? null : widget.registration.seatingCapacity;
    _acAvailable = widget.registration.acAvailable.isEmpty ? null : widget.registration.acAvailable;
  }

  bool _validate() {
    final year = int.tryParse(_yearController.text.trim());
    setState(() {
      _fuelError = _fuelType == null ? 'Please select a fuel type' : null;
      _yearError = (year == null || year < 1990 || year > DateTime.now().year)
          ? 'Enter a valid manufacturing year'
          : null;
      _seatingError = _seatingCapacity == null ? 'Please select seating capacity' : null;
      _acError = _acAvailable == null ? 'Please select an option' : null;
    });
    return [_fuelError, _yearError, _seatingError, _acError].every((e) => e == null);
  }

  void _handleNext() {
    if (!_validate()) return;
    widget.registration.update(() {
      widget.registration.fuelType = _fuelType!;
      widget.registration.manufacturingYear = _yearController.text.trim();
      widget.registration.seatingCapacity = _seatingCapacity!;
      widget.registration.acAvailable = _acAvailable!;
    });
    widget.registration.nextStep();
    context.pushReplacement('/auth/register/docs-identity', extra: widget.registration);
  }

  void _handleBack() {
    widget.registration.previousStep();
    context.pushReplacement('/auth/register/vehicle-basic', extra: widget.registration);
  }

  @override
  void dispose() {
    _yearController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RegistrationStepScaffold(
      registration: widget.registration,
      onNext: _handleNext,
      onBack: _handleBack,
      headerIcon: Icons.settings_outlined,
      headerTitle: 'Vehicle Specifications',
      headerSubtitle: 'A few more details about your vehicle',
      children: [
        SelectField(
          label: 'Fuel Type',
          value: _fuelType,
          placeholder: 'Select fuel type',
          leftIcon: Icons.local_gas_station_outlined,
          options: _fuelTypes,
          errorText: _fuelError,
          onChanged: (v) => setState(() => _fuelType = v),
        ),
        const SizedBox(height: 20),
        AppTextField(
          label: 'Manufacturing Year',
          placeholder: 'e.g. 2022',
          leftIcon: Icons.calendar_today_outlined,
          keyboardType: TextInputType.number,
          maxLength: 4,
          controller: _yearController,
          errorText: _yearError,
        ),
        const SizedBox(height: 20),
        SelectField(
          label: 'Seating Capacity',
          value: _seatingCapacity,
          placeholder: 'Select seating capacity',
          leftIcon: Icons.event_seat_outlined,
          options: _seatingOptions,
          errorText: _seatingError,
          onChanged: (v) => setState(() => _seatingCapacity = v),
        ),
        const SizedBox(height: 20),
        SelectField(
          label: 'AC Available',
          value: _acAvailable,
          placeholder: 'Select an option',
          leftIcon: Icons.ac_unit_outlined,
          options: _yesNo,
          errorText: _acError,
          onChanged: (v) => setState(() => _acAvailable = v),
        ),
      ],
    );
  }
}
