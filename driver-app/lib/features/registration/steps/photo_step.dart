import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../app/theme.dart';
import '../../../core/widgets/document_upload_card.dart';
import '../registration_provider.dart';
import '../registration_step_scaffold.dart';

/// Step 8 — Verification photos. Profile photo (gallery) + Selfie and
/// Vehicle Front (camera — per Phase 2 decision: "pass ImageSource.camera
/// for the Step 8 verification-photo fields (selfie, vehicle front)").
class PhotoStep extends StatefulWidget {
  final RegistrationData registration;
  const PhotoStep({super.key, required this.registration});

  @override
  State<PhotoStep> createState() => _PhotoStepState();
}

class _PhotoStepState extends State<PhotoStep> {
  late String? _profilePhoto = widget.registration.profilePhoto;
  late String? _selfiePhoto = widget.registration.selfiePhoto;
  late String? _vehicleFrontPhoto = widget.registration.vehicleFrontPhoto;

  String? _error;

  bool _validate() {
    final allUploaded =
        [_profilePhoto, _selfiePhoto, _vehicleFrontPhoto].every((p) => p != null && p.isNotEmpty);
    setState(() => _error = allUploaded ? null : 'Please add all 3 photos to continue');
    return allUploaded;
  }

  void _handleNext() {
    if (!_validate()) return;
    widget.registration.update(() {
      widget.registration.profilePhoto = _profilePhoto;
      widget.registration.selfiePhoto = _selfiePhoto;
      widget.registration.vehicleFrontPhoto = _vehicleFrontPhoto;
    });
    widget.registration.nextStep();
    context.pushReplacement('/auth/register/review', extra: widget.registration);
  }

  void _handleBack() {
    widget.registration.previousStep();
    context.pushReplacement('/auth/register/docs-vehicle', extra: widget.registration);
  }

  @override
  Widget build(BuildContext context) {
    return RegistrationStepScaffold(
      registration: widget.registration,
      onNext: _handleNext,
      onBack: _handleBack,
      nextLabel: 'Review Application',
      headerIcon: Icons.camera_alt_outlined,
      headerTitle: 'Verification Photos',
      headerSubtitle: 'A profile photo, a live selfie, and a front shot of your vehicle',
      children: [
        DocumentUploadCard(
          title: 'Profile Photo',
          subtitle: 'Tap to choose from gallery',
          imagePath: _profilePhoto,
          icon: Icons.account_circle_outlined,
          jwtToken: widget.registration.jwtToken,
          onChanged: (p) => setState(() => _profilePhoto = p),
        ),
        const SizedBox(height: 14),
        DocumentUploadCard(
          title: 'Live Selfie',
          subtitle: 'Tap to take a selfie',
          imagePath: _selfiePhoto,
          icon: Icons.face_outlined,
          source: ImageSource.camera,
          jwtToken: widget.registration.jwtToken,
          onChanged: (p) => setState(() => _selfiePhoto = p),
        ),
        const SizedBox(height: 14),
        DocumentUploadCard(
          title: 'Vehicle — Front View',
          subtitle: 'Tap to take a photo',
          imagePath: _vehicleFrontPhoto,
          icon: Icons.directions_car_outlined,
          source: ImageSource.camera,
          jwtToken: widget.registration.jwtToken,
          onChanged: (p) => setState(() => _vehicleFrontPhoto = p),
        ),
        if (_error != null) ...[
          const SizedBox(height: 14),
          Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 12)),
        ],
      ],
    );
  }
}
