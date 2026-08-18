// lib/screens/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/theme_scope.dart';
import '../../routes/app_routes.dart';
import '../../core/services/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _userProfile;
  bool _isLoading = true;
  bool _showPin = false;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final profile = await AuthService.getUserProfile();
      if (!mounted) return;
      setState(() {
        _userProfile = profile;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  Future<void> _confirmLogout(BuildContext context) async {
    final colors = AppColors.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: colors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Log out?', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
        content: Text(
          'You\'ll need to sign in again to book a ride.',
          style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text('Cancel', style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(
              'Log out',
              style: AppTextStyles.body.copyWith(
                color: Colors.redAccent,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      Navigator.of(context).pushNamedAndRemoveUntil(
        AppRoutes.login,
        (route) => false,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Logged out')),
      );
    }
  }

  void _showComingSoon(BuildContext context, String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$feature — coming soon')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          children: [
            _buildTopBar(context),
            const SizedBox(height: 32),
            _buildProfileCard(context),
            const SizedBox(height: 32),
            _buildSectionTitle(context, 'Account'),
            _buildMenuCard(
              context: context,
              items: [
                _MenuItem(icon: Icons.history, label: 'My Bookings', route: AppRoutes.myRides),
                _MenuItem(icon: Icons.person_outline, label: 'Personal Information', route: AppRoutes.accountDetails),
                _MenuItem(icon: Icons.location_on_outlined, label: 'Saved Locations', onTap: () => _showComingSoon(context, 'Saved Locations')),
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
            const SizedBox(height: 24),
            _buildSectionTitle(context, 'About'),
            _buildMenuCard(
              context: context,
              items: [
                _MenuItem(icon: Icons.help_outline, label: 'Help & Support', route: AppRoutes.helpSupport),
                _MenuItem(icon: Icons.description_outlined, label: 'Terms & Conditions', onTap: () => _showComingSoon(context, 'Terms & Conditions')),
                _MenuItem(icon: Icons.privacy_tip_outlined, label: 'Privacy Policy', onTap: () => _showComingSoon(context, 'Privacy Policy')),
              ],
            ),
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
        if (Navigator.canPop(context)) ...[
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

  Widget _buildProfileCard(BuildContext context) {
    final colors = AppColors.of(context);
    final String fullName = _userProfile?['fullName'] ?? 'Guest User';
    final String phone = _userProfile?['phoneNumber'] ?? 'N/A';
    final String email = _userProfile?['email'] ?? 'N/A';
    final String imageUrl = _userProfile?['profileImage'] ?? '';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colors.surfaceCard,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colors.inputBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGold))
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
                child: imageUrl.isEmpty ? Icon(Icons.person, color: colors.accentIcon, size: 40) : null,
              ),
              const SizedBox(height: 16),
              Text(fullName, style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary, fontSize: 24)),
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
                  border: Border.all(color: colors.inputBorder.withOpacity(0.5)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.pin, color: AppColors.primaryGold, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'Ride PIN: ${_showPin ? (_userProfile?['ridePin'] ?? 'N/A') : '••••'}',
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