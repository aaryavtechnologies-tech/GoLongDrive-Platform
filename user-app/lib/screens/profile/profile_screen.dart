// lib/screens/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/theme_scope.dart';
import '../../routes/app_routes.dart';

/// Profile screen — reached from the avatar icon on Home.
///
/// Menu rows navigate to their real (UI-only) screens — Account Details,
/// Payment Methods, Ride History, Notifications, Help & Support — each of
/// which has its own BACKEND HOOKUP notes for wiring real data in. Logout
/// shows a confirmation dialog; confirming pops back to the app root and
/// shows a mock "Logged out" SnackBar (no auth wiring yet).
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  static const List<_ProfileMenuItem> _menuItems = [
    _ProfileMenuItem(
      icon: Icons.person_outline,
      label: 'Account Details',
      route: AppRoutes.accountDetails,
    ),
    _ProfileMenuItem(
      icon: Icons.payment_outlined,
      label: 'Payment Methods',
      route: AppRoutes.paymentMethods,
    ),
    _ProfileMenuItem(
      icon: Icons.history,
      label: 'Ride History',
      route: AppRoutes.rideHistory,
    ),
    _ProfileMenuItem(
      icon: Icons.notifications_none,
      label: 'Notifications',
      route: AppRoutes.notifications,
    ),
    _ProfileMenuItem(
      icon: Icons.help_outline,
      label: 'Help & Support',
      route: AppRoutes.helpSupport,
    ),
  ];

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
      // TODO: wire to real auth/session teardown when backend lands.
      Navigator.of(context).pushNamedAndRemoveUntil(
        AppRoutes.login,
        (route) => false,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Logged out')),
      );
    }
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
            const SizedBox(height: 24),
            _buildProfileHeader(context),
            const SizedBox(height: 24),
            _buildThemeToggle(context),
            const SizedBox(height: 28),
            _buildMenuList(context),
            const SizedBox(height: 28),
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
        Semantics(
          button: true,
          label: 'Back',
          child: ExcludeSemantics(
            child: GestureDetector(
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
          ),
        ),
        const SizedBox(width: 16),
        Text('Profile', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildProfileHeader(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      children: [
        Container(
          height: 64,
          width: 64,
          decoration: BoxDecoration(
            color: colors.surface,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.person, color: colors.accentIcon, size: 32),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Guest User',
                style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                '+91 00000 00000',
                style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildThemeToggle(BuildContext context) {
    final colors = AppColors.of(context);
    final controller = ThemeScope.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(
            controller.isDark ? Icons.dark_mode_outlined : Icons.light_mode_outlined,
            color: controller.isDark ? AppColors.primaryGold : colors.textPrimary,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Dark Mode',
              style: AppTextStyles.body.copyWith(color: colors.textPrimary),
            ),
          ),
          Switch(
            value: controller.isDark,
            onChanged: (_) => controller.toggle(),
            activeColor: AppColors.primaryGold,
          ),
        ],
      ),
    ).animate().fadeIn(delay: 120.ms, duration: 300.ms);
  }

  Widget _buildMenuList(BuildContext context) {
    return Column(
      children: _menuItems
          .map(
            (item) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _ProfileMenuTile(
            item: item,
            onTap: () => Navigator.of(context).pushNamed(item.route),
          ),
        ),
      )
          .toList(),
    ).animate().fadeIn(delay: 150.ms, duration: 300.ms);
  }

  Widget _buildLogoutButton(BuildContext context) {
    final colors = AppColors.of(context);
    return GestureDetector(
      onTap: () => _confirmLogout(context),
      child: Container(
        height: 52,
        width: double.infinity,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.redAccent.withOpacity(0.4)),
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
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }
}

class _ProfileMenuItem {
  final IconData icon;
  final String label;
  final String route;

  const _ProfileMenuItem({
    required this.icon,
    required this.label,
    required this.route,
  });
}

class _ProfileMenuTile extends StatelessWidget {
  final _ProfileMenuItem item;
  final VoidCallback onTap;

  const _ProfileMenuTile({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Material(
      color: colors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: colors.background,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(item.icon, color: AppColors.primaryGold, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  item.label,
                  style: AppTextStyles.body.copyWith(color: colors.textPrimary),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(Icons.chevron_right, color: colors.textSecondary, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}