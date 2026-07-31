import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme.dart';
import '../../../core/widgets/document_upload_card.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';

/// Step 6 — Identity documents. Aadhaar (front/back) + Driving License
/// (front/back), all via gallery upload (default `DocumentUploadCard`
/// source, per Phase 2 decision — camera is reserved for Step 8).
class DocsIdentityStep extends StatefulWidget {
  final RegistrationData registration;
  const DocsIdentityStep({super.key, required this.registration});

  @override
  State<DocsIdentityStep> createState() => _DocsIdentityStepState();
}

class _DocsIdentityStepState extends State<DocsIdentityStep> {
  late String? _aadhaarFront = widget.registration.aadhaarFront;
  late String? _aadhaarBack = widget.registration.aadhaarBack;
  late String? _licenseFront = widget.registration.licenseFront;
  late String? _licenseBack = widget.registration.licenseBack;

  String? _error;

  bool _validate() {
    final allUploaded = [_aadhaarFront, _aadhaarBack, _licenseFront, _licenseBack]
        .every((p) => p != null && p.isNotEmpty);
    setState(() => _error = allUploaded ? null : 'Please upload all 4 documents to continue');
    return allUploaded;
  }

  void _handleNext() {
    if (!_validate()) return;
    widget.registration.update(() {
      widget.registration.aadhaarFront = _aadhaarFront;
      widget.registration.aadhaarBack = _aadhaarBack;
      widget.registration.licenseFront = _licenseFront;
      widget.registration.licenseBack = _licenseBack;
    });
    widget.registration.nextStep();
    context.pushReplacement('/auth/register/docs-vehicle', extra: widget.registration);
  }

  void _handleBack() {
    widget.registration.previousStep();
    context.pushReplacement('/auth/register/vehicle-specs', extra: widget.registration);
  }

  @override
  Widget build(BuildContext context) {
    return RegistrationStepScaffold(
      registration: widget.registration,
      onNext: _handleNext,
      onBack: _handleBack,
      headerIcon: Icons.badge_outlined,
      headerTitle: 'Identity Documents',
      headerSubtitle: 'Upload clear photos of your Aadhaar and driving license',
      children: [
        DocumentUploadCard(
          title: 'Aadhaar Card — Front',
          imagePath: _aadhaarFront,
          icon: Icons.credit_card,
          onChanged: (p) => setState(() => _aadhaarFront = p),
        ),
        const SizedBox(height: 14),
        DocumentUploadCard(
          title: 'Aadhaar Card — Back',
          imagePath: _aadhaarBack,
          icon: Icons.credit_card,
          onChanged: (p) => setState(() => _aadhaarBack = p),
        ),
        const SizedBox(height: 14),
        DocumentUploadCard(
          title: 'Driving License — Front',
          imagePath: _licenseFront,
          icon: Icons.badge_outlined,
          onChanged: (p) => setState(() => _licenseFront = p),
        ),
        const SizedBox(height: 14),
        DocumentUploadCard(
          title: 'Driving License — Back',
          imagePath: _licenseBack,
          icon: Icons.badge_outlined,
          onChanged: (p) => setState(() => _licenseBack = p),
        ),
        if (_error != null) ...[
          const SizedBox(height: 14),
          Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 12)),
        ],
      ],
    );
  }
}
