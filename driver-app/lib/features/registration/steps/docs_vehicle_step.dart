import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme.dart';
import '../../../core/widgets/document_upload_card.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';

/// Step 7 — Vehicle documents. RC (front/back) + Insurance Certificate +
/// PUC Certificate, all via gallery upload (matches Step 6's convention).
class DocsVehicleStep extends StatefulWidget {
  final RegistrationData registration;
  const DocsVehicleStep({super.key, required this.registration});

  @override
  State<DocsVehicleStep> createState() => _DocsVehicleStepState();
}

class _DocsVehicleStepState extends State<DocsVehicleStep> {
  late String? _rcFront = widget.registration.rcFront;
  late String? _rcBack = widget.registration.rcBack;
  late String? _insurance = widget.registration.insuranceCertificate;
  late String? _puc = widget.registration.pucCertificate;

  String? _error;

  bool _validate() {
    final allUploaded =
        [_rcFront, _rcBack, _insurance, _puc].every((p) => p != null && p.isNotEmpty);
    setState(() => _error = allUploaded ? null : 'Please upload all 4 documents to continue');
    return allUploaded;
  }

  void _handleNext() {
    if (!_validate()) return;
    widget.registration.update(() {
      widget.registration.rcFront = _rcFront;
      widget.registration.rcBack = _rcBack;
      widget.registration.insuranceCertificate = _insurance;
      widget.registration.pucCertificate = _puc;
    });
    widget.registration.nextStep();
    context.pushReplacement('/auth/register/photos', extra: widget.registration);
  }

  void _handleBack() {
    widget.registration.previousStep();
    context.pushReplacement('/auth/register/docs-identity', extra: widget.registration);
  }

  @override
  Widget build(BuildContext context) {
    return RegistrationStepScaffold(
      registration: widget.registration,
      onNext: _handleNext,
      onBack: _handleBack,
      headerIcon: Icons.description_outlined,
      headerTitle: 'Vehicle Documents',
      headerSubtitle: 'Upload your RC, insurance, and PUC certificates',
      children: [
        DocumentUploadCard(
          title: 'RC — Front',
          imagePath: _rcFront,
          icon: Icons.description_outlined,
          onChanged: (p) => setState(() => _rcFront = p),
        ),
        const SizedBox(height: 14),
        DocumentUploadCard(
          title: 'RC — Back',
          imagePath: _rcBack,
          icon: Icons.description_outlined,
          onChanged: (p) => setState(() => _rcBack = p),
        ),
        const SizedBox(height: 14),
        DocumentUploadCard(
          title: 'Insurance Certificate',
          imagePath: _insurance,
          icon: Icons.verified_user_outlined,
          onChanged: (p) => setState(() => _insurance = p),
        ),
        const SizedBox(height: 14),
        DocumentUploadCard(
          title: 'PUC Certificate',
          imagePath: _puc,
          icon: Icons.eco_outlined,
          onChanged: (p) => setState(() => _puc = p),
        ),
        if (_error != null) ...[
          const SizedBox(height: 14),
          Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 12)),
        ],
      ],
    );
  }
}
