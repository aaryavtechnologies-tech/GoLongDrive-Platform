import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/mock_data.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/app_text_field.dart';
import '../../core/widgets/app_button.dart';

/// Settings → Edit Profile.
/// Prefilled from `MockData.driverProfile`. Local-state only for now —
/// there's no `PATCH /driver/profile` yet, so Save just shows a
/// confirmation and pops back (same "no backend yet" pattern used by
/// `CurrentRideScreen._advance` and the registration wizard's review step;
/// see BACKEND_API_SPEC.md for where the real call should go).
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _phoneCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _vehicleModelCtrl;
  late final TextEditingController _vehicleNumberCtrl;

  @override
  void initState() {
    super.initState();
    final profile = MockData.driverProfile;
    _nameCtrl = TextEditingController(text: profile.name);
    _phoneCtrl = TextEditingController(text: profile.phone);
    _emailCtrl = TextEditingController(text: profile.email);
    _vehicleModelCtrl = TextEditingController(text: profile.vehicleModel);
    _vehicleNumberCtrl = TextEditingController(text: profile.vehicleNumber);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _vehicleModelCtrl.dispose();
    _vehicleNumberCtrl.dispose();
    super.dispose();
  }

  void _save() {
    // TODO: Backend — PATCH /driver/profile with the edited fields.
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Profile updated')),
    );
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 24, 8),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: 4),
                  const Text('Edit Profile', style: AppText.cardHeadline),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: cardDecoration(radius: 24),
                    child: Column(
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.gold, width: 2),
                          ),
                          child: const Icon(Icons.person, color: AppColors.gold, size: 34),
                        ),
                        const SizedBox(height: 10),
                        TextButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Photo upload coming soon')),
                            );
                          },
                          child: const Text('Change Photo',
                              style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  AppTextField(
                    label: 'Full Name',
                    controller: _nameCtrl,
                    leftIcon: Icons.person_outline,
                    textCapitalization: TextCapitalization.words,
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    label: 'Phone Number',
                    controller: _phoneCtrl,
                    leftIcon: Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    label: 'Email',
                    controller: _emailCtrl,
                    leftIcon: Icons.mail_outline,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 24),
                  const Text('Vehicle', style: AppText.sectionTitle),
                  const SizedBox(height: 12),
                  AppTextField(
                    label: 'Vehicle Model',
                    controller: _vehicleModelCtrl,
                    leftIcon: Icons.directions_car_outlined,
                    textCapitalization: TextCapitalization.words,
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    label: 'Vehicle Number',
                    controller: _vehicleNumberCtrl,
                    leftIcon: Icons.confirmation_number_outlined,
                    textCapitalization: TextCapitalization.characters,
                  ),
                  const SizedBox(height: 28),
                  AppButton(label: 'Save Changes', onPressed: _save),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
