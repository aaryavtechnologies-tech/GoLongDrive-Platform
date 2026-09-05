import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/app_text_field.dart';
import '../../core/widgets/app_button.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final TextEditingController _nameCtrl = TextEditingController();
  final TextEditingController _phoneCtrl = TextEditingController();
  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _vehicleModelCtrl = TextEditingController();
  final TextEditingController _vehicleNumberCtrl = TextEditingController();
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final res = await ApiService.get('/driver/profile');
      if (res.statusCode == 200) {
        final driver = jsonDecode(res.body)['data']['driver'];
        _nameCtrl.text = driver['fullName'] ?? '';
        _phoneCtrl.text = driver['phoneNumber'] ?? '';
        _emailCtrl.text = driver['email'] ?? '';
        _vehicleModelCtrl.text = driver['vehicleDetails']?['model'] ?? '';
        _vehicleNumberCtrl.text = driver['vehicleDetails']?['registrationNumber'] ?? '';
      }
    } catch (e) {
      debugPrint('Failed to fetch profile: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
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

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final res = await ApiService.put('/driver/profile', body: {
        'fullName': _nameCtrl.text,
        'phoneNumber': _phoneCtrl.text,
      });
      if (res.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile updated successfully')),
          );
          context.pop();
        }
      } else {
        throw Exception('Failed to update profile');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error updating profile')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
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
                  AppButton(label: 'Save Changes', onPressed: _save, isLoading: _saving),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
