import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/card_decoration.dart';

/// Settings → Notifications.
/// Local-state toggles only — no push-notification-preferences endpoint
/// exists yet, see BACKEND_API_SPEC.md. Same `Material` + `SwitchListTile`
/// pattern as the Dark Mode row on the Profile screen, so ink/Material
/// effects render correctly on top of the card's `DecoratedBox`.
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationSetting {
  final String title;
  final String subtitle;
  final IconData icon;
  bool enabled;

  _NotificationSetting({
    required this.title,
    required this.subtitle,
    required this.icon,
    this.enabled = true,
  });
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<_NotificationSetting> _rideSettings = [
    _NotificationSetting(
      title: 'Ride Requests',
      subtitle: 'New ride requests near you',
      icon: Icons.local_taxi_outlined,
    ),
    _NotificationSetting(
      title: 'Trip Reminders',
      subtitle: 'Upcoming scheduled trips',
      icon: Icons.schedule_outlined,
    ),
    _NotificationSetting(
      title: 'Earnings Updates',
      subtitle: 'Daily and weekly earnings summaries',
      icon: Icons.payments_outlined,
    ),
  ];

  final List<_NotificationSetting> _generalSettings = [
    _NotificationSetting(
      title: 'Promotions & Offers',
      subtitle: 'Bonus opportunities and incentives',
      icon: Icons.local_offer_outlined,
    ),
    _NotificationSetting(
      title: 'App Updates',
      subtitle: 'New features and important changes',
      icon: Icons.system_update_outlined,
      enabled: false,
    ),
  ];

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
                  const Text('Notifications', style: AppText.cardHeadline),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                children: [
                  const Text('Ride Activity', style: AppText.sectionTitle),
                  const SizedBox(height: 12),
                  _settingsGroup(_rideSettings),
                  const SizedBox(height: 24),
                  const Text('General', style: AppText.sectionTitle),
                  const SizedBox(height: 12),
                  _settingsGroup(_generalSettings),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _settingsGroup(List<_NotificationSetting> settings) {
    return Container(
      decoration: cardDecoration(bg: AppColors.surfaceAlt, radius: 24),
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        children: [
          for (var i = 0; i < settings.length; i++) ...[
            _toggleRow(settings[i]),
            if (i != settings.length - 1)
              Divider(color: AppColors.borderSubtle, height: 1, indent: 16, endIndent: 16),
          ],
        ],
      ),
    );
  }

  Widget _toggleRow(_NotificationSetting setting) {
    return Material(
      color: Colors.transparent,
      child: SwitchListTile(
        value: setting.enabled,
        onChanged: (value) => setState(() => setting.enabled = value),
        activeColor: AppColors.gold,
        secondary: Icon(setting.icon, color: AppColors.textMuted, size: 22),
        title: Text(setting.title,
            style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text(setting.subtitle, style: TextStyle(color: AppColors.textFaint, fontSize: 12)),
      ),
    );
  }
}
