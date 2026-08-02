import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../../app/theme.dart';
import '../../../core/config/env_config.dart';
import '../../../core/widgets/card_decoration.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';

/// Step 9 — Review & submit. Read-only summary of every prior step, each
/// section in its own card with an "Edit" link that jumps back to that
/// step (`registration.goToStep(n)` + `context.pushReplacement(..., extra:
/// widget.registration)` — same pattern used by every step's Next/Back
/// handler, via go_router as of Phase 6).
///
/// On submit: simulates an API call (matches `ResetPasswordScreen`'s
/// `isLoading` + `Future.delayed` convention, see PROJECT_STATUS.md §6),
/// then a snackbar + `context.go('/login')` — the "Register → Login
/// (success)" step of the nav flow diagram (§1).
class ReviewStep extends StatefulWidget {
  final RegistrationData registration;
  const ReviewStep({super.key, required this.registration});

  @override
  State<ReviewStep> createState() => _ReviewStepState();
}

class _ReviewStepState extends State<ReviewStep> {
  bool _isSubmitting = false;

  void _goToStep(int step, String route) {
    widget.registration.goToStep(step);
    context.pushReplacement(route, extra: widget.registration);
  }

  void _handleBack() {
    widget.registration.previousStep();
    context.pushReplacement('/auth/register/photos', extra: widget.registration);
  }

  Future<void> _handleSubmit() async {
    setState(() => _isSubmitting = true);
    
    try {
      final url = Uri.parse('${EnvConfig.apiUrl}/driver/submit-registration');
      final requestBody = {
        'dateOfBirth': widget.registration.dateOfBirth,
        'address': {
          'street': widget.registration.street,
          'city': widget.registration.city,
          'state': widget.registration.state,
          'pincode': widget.registration.pincode,
        },
        'vehicle': {
          'brand': widget.registration.vehicleBrand,
          'model': widget.registration.vehicleModel,
          'registrationNumber': widget.registration.registrationNumber,
          'type': widget.registration.vehicleType,
          'fuelType': widget.registration.fuelType,
          'manufacturingYear': widget.registration.manufacturingYear,
          'seatingCapacity': widget.registration.seatingCapacity,
          'acAvailable': widget.registration.acAvailable,
        },
        'documents': {
          'aadhaarFront': widget.registration.aadhaarFront,
          'aadhaarBack': widget.registration.aadhaarBack,
          'licenseFront': widget.registration.licenseFront,
          'licenseBack': widget.registration.licenseBack,
          'rcFront': widget.registration.rcFront,
          'rcBack': widget.registration.rcBack,
          'insuranceCertificate': widget.registration.insuranceCertificate,
          'pucCertificate': widget.registration.pucCertificate,
          'selfiePhoto': widget.registration.selfiePhoto,
          'vehicleFrontPhoto': widget.registration.vehicleFrontPhoto,
        }
      };

      debugPrint('>>> API REQUEST: POST $url');
      debugPrint('>>> PAYLOAD: $requestBody');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.registration.jwtToken}',
        },
        body: jsonEncode(requestBody),
      );

      debugPrint('<<< API RESPONSE: ${response.statusCode}');
      debugPrint('<<< BODY: ${response.body}');

      if (!mounted) return;
      setState(() => _isSubmitting = false);

      if (response.statusCode == 201 || response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registration successful! Awaiting approval.'),
          ),
        );
        context.go('/login');
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

  @override
  Widget build(BuildContext context) {
    final r = widget.registration;

    return RegistrationStepScaffold(
      registration: r,
      onNext: _handleSubmit,
      onBack: _handleBack,
      isNextLoading: _isSubmitting,
      nextLabel: 'Submit Application',
      headerIcon: Icons.fact_check_outlined,
      headerTitle: 'Review & Submit',
      headerSubtitle: 'Please check everything below before submitting your application',
      children: [
        _sectionCard(
          title: 'Personal Details',
          onEdit: () => _goToStep(1, '/auth/register'),
          rows: [
            _row('Full Name', r.fullName),
            _row('Phone', r.phone),
            _row('Email', r.email),
            _row('Date of Birth', r.dateOfBirth),
          ],
        ),
        const SizedBox(height: 14),
        _sectionCard(
          title: 'Address',
          onEdit: () => _goToStep(2, '/auth/register/address'),
          rows: [
            _row('Street', r.street),
            _row('City', r.city),
            _row('State', r.state),
            _row('Pincode', r.pincode),
          ],
        ),
        const SizedBox(height: 14),
        _sectionCard(
          title: 'Account',
          onEdit: () => _goToStep(3, '/auth/register/account'),
          rows: [
            _row('Password', '\u2022' * 8),
            _row('Terms Accepted', r.acceptedTerms ? 'Yes' : 'No'),
          ],
        ),
        const SizedBox(height: 14),
        _sectionCard(
          title: 'Vehicle',
          onEdit: () => _goToStep(4, '/auth/register/vehicle-basic'),
          rows: [
            _row('Brand', r.vehicleBrand),
            _row('Model', r.vehicleModel),
            _row('Registration No.', r.registrationNumber),
            _row('Type', r.vehicleType),
          ],
        ),
        const SizedBox(height: 14),
        _sectionCard(
          title: 'Vehicle Specifications',
          onEdit: () => _goToStep(5, '/auth/register/vehicle-specs'),
          rows: [
            _row('Fuel Type', r.fuelType),
            _row('Manufacturing Year', r.manufacturingYear),
            _row('Seating Capacity', r.seatingCapacity),
            _row('AC Available', r.acAvailable),
          ],
        ),
        const SizedBox(height: 14),
        _sectionCard(
          title: 'Identity Documents',
          onEdit: () => _goToStep(6, '/auth/register/docs-identity'),
          rows: [
            _docRow('Aadhaar Card', r.aadhaarFront != null && r.aadhaarBack != null),
            _docRow('Driving License', r.licenseFront != null && r.licenseBack != null),
          ],
        ),
        const SizedBox(height: 14),
        _sectionCard(
          title: 'Vehicle Documents',
          onEdit: () => _goToStep(7, '/auth/register/docs-vehicle'),
          rows: [
            _docRow('RC (Registration Certificate)', r.rcFront != null && r.rcBack != null),
            _docRow('Insurance Certificate', r.insuranceCertificate != null),
            _docRow('PUC Certificate', r.pucCertificate != null),
          ],
        ),
        const SizedBox(height: 14),
        _sectionCard(
          title: 'Verification Photos',
          onEdit: () => _goToStep(8, '/auth/register/photos'),
          rows: [
            _docRow('Profile Photo', r.profilePhoto != null),
            _docRow('Live Selfie', r.selfiePhoto != null),
            _docRow('Vehicle Front View', r.vehicleFrontPhoto != null),
          ],
        ),
      ],
    );
  }

  Widget _sectionCard({required String title, required VoidCallback onEdit, required List<Widget> rows}) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: formSectionDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700)),
              InkWell(
                onTap: onEdit,
                borderRadius: BorderRadius.circular(8),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.edit_outlined, size: 14, color: AppColors.gold),
                      SizedBox(width: 4),
                      Text('Edit', style: TextStyle(color: AppColors.gold, fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...rows,
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(label, style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value.isEmpty ? '\u2014' : value,
              style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  Widget _docRow(String label, bool uploaded) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Expanded(
            child: Text(label, style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
          ),
          Icon(
            uploaded ? Icons.check_circle : Icons.error_outline,
            size: 16,
            color: uploaded ? AppColors.success : AppColors.error,
          ),
          const SizedBox(width: 6),
          Text(
            uploaded ? 'Uploaded' : 'Missing',
            style: TextStyle(
              color: uploaded ? AppColors.success : AppColors.error,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
