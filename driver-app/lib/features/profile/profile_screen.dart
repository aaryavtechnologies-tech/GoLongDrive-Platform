import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/mock_data.dart';
import '../../core/widgets/card_decoration.dart';

/// Matches app/(tabs)/profile.tsx (§5.11) — Profile tab.
/// Avatar + name/rating header, stat row, and a settings-style menu list.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final profile = MockData.driverProfile;

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
        children: [
          const Text('Profile', style: AppText.cardHeadline),
          const SizedBox(height: 20),

          // --- Header card ---
          Container(
            padding: const EdgeInsets.all(20),
            decoration: cardDecoration(radius: 24),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.gold, width: 2),
                  ),
                  child: const Icon(Icons.person, color: AppColors.gold, size: 30),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(profile.name,
                          style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.star, color: AppColors.gold, size: 16),
                          const SizedBox(width: 4),
                          Text('${profile.rating}',
                              style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 8),
                          Text('· ${profile.totalTrips} trips',
                              style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // --- Contact + vehicle info card ---
          Container(
            padding: const EdgeInsets.all(20),
            decoration: cardDecoration(radius: 24),
            child: Column(
              children: [
                _infoRow(Icons.phone_outlined, 'Phone', profile.phone),
                Divider(color: AppColors.borderSubtle2, height: 24),
                _infoRow(Icons.mail_outline, 'Email', profile.email),
                Divider(color: AppColors.borderSubtle2, height: 24),
                _infoRow(Icons.directions_car_outlined, 'Vehicle', profile.vehicleModel),
                Divider(color: AppColors.borderSubtle2, height: 24),
                _infoRow(Icons.confirmation_number_outlined, 'Vehicle Number', profile.vehicleNumber),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text('Settings', style: AppText.sectionTitle),
          const SizedBox(height: 12),
          Container(
            decoration: cardDecoration(bg: AppColors.surfaceAlt, radius: 24),
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Column(
              children: [
                _themeToggleItem(),
                Divider(color: AppColors.borderSubtle, height: 1, indent: 16, endIndent: 16),
                _menuItem(context, Icons.edit_outlined, 'Edit Profile',
                    onTap: () => context.push('/profile/edit')),
                _menuItem(context, Icons.description_outlined, 'My Documents',
                    onTap: () => context.push('/profile/documents')),
                _menuItem(context, Icons.notifications_outlined, 'Notifications',
                    onTap: () => context.push('/profile/notifications')),
                _menuItem(context, Icons.support_agent, 'Help & Support',
                    onTap: () => context.push('/profile/help')),
                _menuItem(context, Icons.privacy_tip_outlined, 'Privacy Policy',
                    onTap: () => context.push('/profile/privacy')),
                _menuItem(
                  context,
                  Icons.logout,
                  'Log Out',
                  isDestructive: true,
                  showDivider: false,
                  onTap: () => _confirmLogout(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: AppColors.textMuted, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
        ),
        Text(value, style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _themeToggleItem() {
    final isDark = ThemeService.instance.isDarkMode;
    return Material(
      color: Colors.transparent,
      child: SwitchListTile(
        value: isDark,
        onChanged: (_) => ThemeService.instance.toggleTheme(),
        activeColor: AppColors.gold,
        secondary: Icon(isDark ? Icons.dark_mode_outlined : Icons.light_mode_outlined,
            color: AppColors.textMuted, size: 22),
        title: Text('Dark Mode', style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text(isDark ? 'On' : 'Off', style: TextStyle(color: AppColors.textFaint, fontSize: 12)),
      ),
    );
  }

  Widget _menuItem(
    BuildContext context,
    IconData icon,
    String label, {
    bool isDestructive = false,
    bool showDivider = true,
    VoidCallback? onTap,
  }) {
    final color = isDestructive ? AppColors.error : AppColors.textPrimary;
    return Column(
      children: [
        Material(
          color: Colors.transparent,
          child: ListTile(
            leading: Icon(icon, color: isDestructive ? AppColors.error : AppColors.textMuted, size: 22),
            title: Text(label, style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.w600)),
            trailing: isDestructive
                ? null
                : Icon(Icons.chevron_right, color: AppColors.textFaint, size: 20),
            // Every settings row now has a real destination screen (Phase 8)
            // -- see the `context.push('/profile/...')` calls above.
            onTap: onTap ?? () {},
          ),
        ),
        if (showDivider) Divider(color: AppColors.borderSubtle, height: 1, indent: 16, endIndent: 16),
      ],
    );
  }

  /// Confirms before logging out, then clears the whole stack back to
  /// Login via `context.go` (same "home base" pattern used for the
  /// register-success and reset-password-success flows). No AuthService
  /// exists yet — this just navigates; see BACKEND_API_SPEC.md for where
  /// a real token-clear/sign-out call should go once auth is real.
  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: AppColors.surfaceAlt,
        title: Text('Log Out', style: TextStyle(color: AppColors.textPrimary)),
        content: Text(
          'Are you sure you want to log out?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              context.go('/login');
            },
            child: const Text('Log Out', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}
