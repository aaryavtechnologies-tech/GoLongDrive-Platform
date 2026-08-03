// lib/screens/profile/account_details_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../models/user_account.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/back_button.dart';
import '../../widgets/primary_button.dart';

/// Account Details — reached from Profile > "Account Details".
///
/// Lets the rider view/edit their own profile fields (name, email, mobile,
/// gender, DOB, emergency contact).
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only:
///   - `_account` is seeded from `UserAccount.mock` (see user_account.dart)
///     instead of a real fetch. Replace the field initializer with an async
///     load (e.g. in `initState`, call a future `UserService.fetchProfile()`
///     and `setState` when it resolves; show a loading spinner meanwhile).
///   - `_saveChanges()` below currently just validates locally and pops a
///     SnackBar — replace the TODO with a real
///     `PATCH /api/user/profile` call, and only pop/show success once that
///     call actually succeeds (surface a real error otherwise instead of
///     assuming success).
///   - Gender and Date of Birth are simple tap-to-pick fields (dropdown /
///     date picker) with no format validation beyond presence — adjust to
///     whatever shape the backend expects.
/// ===========================================================================
class AccountDetailsScreen extends StatefulWidget {
  const AccountDetailsScreen({super.key});

  @override
  State<AccountDetailsScreen> createState() => _AccountDetailsScreenState();
}

class _AccountDetailsScreenState extends State<AccountDetailsScreen> {
  final _formKey = GlobalKey<FormState>();

  // TODO(backend): replace with a real fetch — see file header.
  UserAccount _account = UserAccount.mock;

  late final TextEditingController _nameController =
      TextEditingController(text: _account.fullName);
  late final TextEditingController _emailController =
      TextEditingController(text: _account.email);
  late final TextEditingController _mobileController =
      TextEditingController(text: _account.mobile);
  late final TextEditingController _emergencyNameController =
      TextEditingController(text: _account.emergencyContactName ?? '');
  late final TextEditingController _emergencyPhoneController =
      TextEditingController(text: _account.emergencyContactPhone ?? '');

  String? _gender;
  String? _dateOfBirth;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _gender = _account.gender;
    _dateOfBirth = _account.dateOfBirth;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _emergencyNameController.dispose();
    _emergencyPhoneController.dispose();
    super.dispose();
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 20),
      firstDate: DateTime(now.year - 100),
      lastDate: now,
    );
    if (picked != null) {
      setState(() {
        _dateOfBirth = '${picked.day}/${picked.month}/${picked.year}';
      });
    }
  }

  Future<void> _saveChanges() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    // TODO(backend): PATCH /api/user/profile with the edited fields below.
    // Only update `_account` / show success once that call actually
    // succeeds — this artificial delay just simulates network latency.
    await Future.delayed(const Duration(milliseconds: 600));

    if (!mounted) return;

    setState(() {
      _account = _account.copyWith(
        fullName: _nameController.text.trim(),
        email: _emailController.text.trim(),
        mobile: _mobileController.text.trim(),
        gender: _gender,
        dateOfBirth: _dateOfBirth,
        emergencyContactName: _emergencyNameController.text.trim(),
        emergencyContactPhone: _emergencyPhoneController.text.trim(),
      );
      _isSaving = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Account details saved')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
            children: [
              _buildTopBar(),
              const SizedBox(height: 24),
              Text('Personal Information', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary))
                  .animate()
                  .fadeIn(delay: 80.ms, duration: 300.ms),
              const SizedBox(height: 16),
              AppTextField(
                label: 'Full Name',
                controller: _nameController,
                prefixIcon: Icons.person_outline,
                validator: Validators.fullName,
              ),
              const SizedBox(height: 16),
              AppTextField(
                label: 'Email',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.email_outlined,
                validator: Validators.email,
              ),
              const SizedBox(height: 16),
              AppTextField(
                label: 'Mobile Number',
                controller: _mobileController,
                keyboardType: TextInputType.phone,
                prefixIcon: Icons.phone_outlined,
                validator: Validators.mobile,
              ),
              const SizedBox(height: 16),
              _buildGenderPicker(),
              const SizedBox(height: 16),
              _buildDobPicker(),
              const SizedBox(height: 28),
              Text('Emergency Contact', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary))
                  .animate()
                  .fadeIn(delay: 80.ms, duration: 300.ms),
              const SizedBox(height: 4),
              Text(
                'Shared only during an active ride, if you choose to use it.',
                style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
              ),
              const SizedBox(height: 16),
              AppTextField(
                label: 'Contact Name',
                controller: _emergencyNameController,
                prefixIcon: Icons.person_outline,
                validator: (_) => null, // optional field
              ),
              const SizedBox(height: 16),
              AppTextField(
                label: 'Contact Phone',
                controller: _emergencyPhoneController,
                keyboardType: TextInputType.phone,
                prefixIcon: Icons.phone_outlined,
                validator: (_) => null, // optional field
              ),
              const SizedBox(height: 32),
              PrimaryButton(
                label: 'Save Changes',
                isLoading: _isSaving,
                onPressed: _isSaving ? null : _saveChanges,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    final colors = AppColors.of(context);
    return Row(
      children: [
        AppBackButton(onPressed: () => Navigator.of(context).pop()),
        const SizedBox(width: 16),
        Text('Account Details', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildGenderPicker() {
    final colors = AppColors.of(context);
    const options = ['Male', 'Female', 'Other', 'Prefer not to say'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Gender', style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: options.map((option) {
            final selected = _gender == option;
            return GestureDetector(
              onTap: () => setState(() => _gender = option),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: selected ? AppColors.primaryGold : colors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: selected ? AppColors.primaryGold : colors.inputBorder,
                  ),
                ),
                child: Text(
                  option,
                  style: AppTextStyles.caption.copyWith(
                    color: selected ? AppColors.textOnGold : colors.textSecondary,
                    fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildDobPicker() {
    final colors = AppColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Date of Birth', style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _pickDateOfBirth,
          child: Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: colors.inputBorder),
            ),
            child: Row(
              children: [
                Icon(Icons.cake_outlined, color: colors.textSecondary, size: 20),
                const SizedBox(width: 12),
                Text(
                  _dateOfBirth ?? 'Select date of birth',
                  style: (_dateOfBirth == null
                          ? AppTextStyles.bodySecondary
                          : AppTextStyles.body)
                      .copyWith(color: _dateOfBirth == null ? colors.textSecondary : colors.textPrimary),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
