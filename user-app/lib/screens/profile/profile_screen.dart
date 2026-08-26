// lib/screens/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/theme_scope.dart';
import '../../routes/app_routes.dart';
import '../../core/services/user_controller.dart';
import '../../core/services/user_scope.dart';
import '../../core/data/api_client.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _showPin = false;

  @override
  void initState() {
    super.initState();
    // Fetch fresh profile data when entering the profile screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        UserScope.of(context, listen: false).fetchProfile();
      }
    });
  }

  Future<void> _confirmLogout(BuildContext context) async {
    final colors = AppColors.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: colors.surfaceCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Log Out', style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary)),
        content: Text(
          'Are you sure you want to log out of your account?',
          style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text('Cancel', style: AppTextStyles.body.copyWith(color: colors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text('Log Out', style: AppTextStyles.body.copyWith(color: Colors.white, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      final userController = UserScope.of(context, listen: false);
      await userController.logout();
      if (context.mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutes.login,
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final userController = UserScope.of(context);

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          children: [
            _buildTopBar(context),
            const SizedBox(height: 32),
            _buildProfileCard(context, userController),
            const SizedBox(height: 32),
            _buildSettingsSection(context),
            const SizedBox(height: 32),
            _buildLogoutButton(context),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      children: [
        if (Navigator.of(context).canPop()) ...[
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: colors.surface,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.arrow_back, color: colors.textPrimary, size: 20),
            ),
          ),
          const SizedBox(width: 16),
        ],
        Text('Profile', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildProfileCard(BuildContext context, UserController userController) {
    final colors = AppColors.of(context);
    final userProfile = userController.userProfile;
    final isLoading = userController.isLoading;

    final String fullName = (userProfile?['fullName'] as String?)?.trim() ?? '';
    final String displayFullName = fullName.isNotEmpty
        ? fullName
        : ((userProfile?['email'] as String?)?.split('@').first ?? 'Rider');
    final String phone = userProfile?['phoneNumber'] ?? 'Not set';
    final String email = userProfile?['email'] ?? 'Not set';
    final String rawImage = userProfile?['profileImage'] ?? '';
    final String imageUrl = rawImage.isNotEmpty
        ? (rawImage.startsWith('http') ? rawImage : '${ApiClient.baseUrl.replaceAll('/api/v1', '')}/$rawImage')
        : '';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colors.inputBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: isLoading
        ? const SizedBox(
            height: 200,
            child: Center(child: CircularProgressIndicator(color: AppColors.primaryGold)),
          )
        : Column(
            children: [
              Container(
                height: 80,
                width: 80,
                decoration: BoxDecoration(
                  color: colors.surfaceElevated,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.primaryGold, width: 2),
                  image: imageUrl.isNotEmpty
                      ? DecorationImage(
                          image: NetworkImage(imageUrl),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: imageUrl.isEmpty
                    ? Center(
                        child: Text(
                          displayFullName.isNotEmpty ? displayFullName[0].toUpperCase() : 'U',
                          style: AppTextStyles.largeHeading.copyWith(color: AppColors.primaryGold),
                        ),
                      )
                    : null,
              ),
              const SizedBox(height: 16),
              Text(displayFullName, style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary, fontSize: 24)),
              const SizedBox(height: 8),
              Text(phone, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
              const SizedBox(height: 4),
              Text(email, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: colors.surfaceSecondary,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: colors.inputBorder.withValues(alpha: 0.5)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.pin, color: AppColors.primaryGold, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'Ride PIN: ${_showPin ? (userProfile?['ridePin'] ?? 'N/A') : '••••'}',
                      style: AppTextStyles.body.copyWith(
                        color: colors.textPrimary, 
                        fontWeight: FontWeight.bold,
                        letterSpacing: _showPin ? 2 : 1.2,
                      ),
                    ),
                    const SizedBox(width: 12),
                    GestureDetector(
                      onTap: () => setState(() => _showPin = !_showPin),
                      child: Icon(
                        _showPin ? Icons.visibility_off : Icons.visibility,
                        color: colors.textSecondary,
                        size: 18,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () => Navigator.of(context).pushNamed(AppRoutes.accountDetails),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.primaryGold),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child: Text('Edit Profile', style: AppTextStyles.body.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
    ).animate().fadeIn(delay: 100.ms, duration: 400.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildSettingsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle(context, 'Account'),
        _buildMenuCard(
          context: context,
          items: [
            _MenuItem(icon: Icons.history, label: 'My Bookings', route: AppRoutes.myRides),
            _MenuItem(icon: Icons.person_outline, label: 'Personal Information', route: AppRoutes.accountDetails),
            _MenuItem(icon: Icons.payment_outlined, label: 'Payment History', route: AppRoutes.paymentMethods),
          ],
        ),
        const SizedBox(height: 24),
        _buildSectionTitle(context, 'Preferences'),
        _buildMenuCard(
          context: context,
          items: [
            _MenuItem(
              icon: ThemeScope.of(context).isDark ? Icons.dark_mode_outlined : Icons.light_mode_outlined,
              label: 'Dark Mode',
              isToggle: true,
              toggleValue: ThemeScope.of(context).isDark,
              onToggle: (_) => ThemeScope.of(context).toggle(),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    final colors = AppColors.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(title, style: AppTextStyles.subtitle.copyWith(color: colors.textSecondary)),
    ).animate().fadeIn(delay: 150.ms, duration: 300.ms);
  }

  Widget _buildMenuCard({required BuildContext context, required List<_MenuItem> items}) {
    final colors = AppColors.of(context);
    return Container(
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.inputBorder),
      ),
      child: Column(
        children: List.generate(items.length, (index) {
          final item = items[index];
          return Column(
            children: [
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: item.isToggle
                      ? null
                      : () {
                          if (item.onTap != null) {
                            item.onTap!();
                          } else if (item.route != null) {
                            Navigator.of(context).pushNamed(item.route!);
                          }
                        },
                  borderRadius: index == 0
                      ? const BorderRadius.vertical(top: Radius.circular(20))
                      : index == items.length - 1
                          ? const BorderRadius.vertical(bottom: Radius.circular(20))
                          : BorderRadius.zero,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: colors.surfaceElevated,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(item.icon, color: AppColors.primaryGold, size: 20),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(item.label, style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w500)),
                        ),
                        if (item.isToggle)
                          Switch(
                            value: item.toggleValue ?? false,
                            onChanged: item.onToggle,
                            activeColor: AppColors.primaryGold,
                          )
                        else
                          Icon(Icons.chevron_right, color: colors.textSecondary, size: 20),
                      ],
                    ),
                  ),
                ),
              ),
              if (index < items.length - 1)
                Padding(
                  padding: const EdgeInsets.only(left: 60),
                  child: Container(height: 1, color: colors.divider),
                ),
            ],
          );
        }),
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 400.ms);
  }

  Widget _buildLogoutButton(BuildContext context) {
    final colors = AppColors.of(context);
    return GestureDetector(
      onTap: () => _confirmLogout(context),
      child: Container(
        height: 56,
        width: double.infinity,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: colors.surfaceCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.redAccent.withValues(alpha: 0.5)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.logout, color: Colors.redAccent, size: 20),
            const SizedBox(width: 10),
            Text(
              'Log Out',
              style: AppTextStyles.body.copyWith(
                color: Colors.redAccent,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 300.ms, duration: 300.ms);
  }
}

class _MenuItem {
  final IconData icon;
  final String label;
  final String? route;
  final VoidCallback? onTap;
  final bool isToggle;
  final bool? toggleValue;
  final ValueChanged<bool>? onToggle;

  const _MenuItem({
    required this.icon,
    required this.label,
    this.route,
    this.onTap,
    this.isToggle = false,
    this.toggleValue,
    this.onToggle,
  });
}