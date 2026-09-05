// lib/screens/profile/notifications_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/notification_item.dart';
import '../../widgets/back_button.dart';

/// Notifications — reached from Profile > "Notifications".
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only — see the full checklist in `models/notification_item.dart`.
/// In short: `_notifications` is hardcoded mock data in this State and
/// "read" state lives only in local `setState` (lost on screen close).
/// Replace with a real fetch + a push (FCM/APNs) subscription, and persist
/// read/unread server-side instead of locally.
/// ===========================================================================
import '../../core/services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<NotificationItem> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    final notifications = await NotificationService.getMyNotifications();
    if (mounted) {
      setState(() {
        _notifications = notifications;
        _isLoading = false;
      });
    }
  }

  Future<void> _markAsRead(String id) async {
    setState(() {
      _notifications = _notifications
          .map((n) => n.id == id ? n.copyWith(isRead: true) : n)
          .toList();
    });
    await NotificationService.markAsRead(id);
  }

  Future<void> _markAllAsRead() async {
    setState(() {
      _notifications = _notifications.map((n) => n.copyWith(isRead: true)).toList();
    });
    // Iterate over unread notifications and mark them as read in the backend
    for (var n in _notifications) {
      if (!n.isRead) {
         await NotificationService.markAsRead(n.id);
      }
    }
  }

  void _openNotification(NotificationItem item) {
    if (!item.isRead) _markAsRead(item.id);
    // TODO(backend/nav): deep-link ride notifications to that ride's
    // details (via item.relatedRideId) once RideDetailsScreen exists.
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(item.title)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasUnread = _notifications.any((n) => !n.isRead);

    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          children: [
            _buildTopBar(hasUnread),
            const SizedBox(height: 20),
            if (_isLoading)
              const Padding(
                padding: EdgeInsets.only(top: 100),
                child: Center(child: CircularProgressIndicator(color: AppColors.primaryGold)),
              )
            else if (_notifications.isEmpty)
              _buildEmptyState()
            else
              ..._notifications.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _NotificationTile(
                    item: item,
                    onTap: () => _openNotification(item),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar(bool hasUnread) {
    final colors = AppColors.of(context);
    return Row(
      children: [
        AppBackButton(onPressed: () => Navigator.of(context).pop()),
        const SizedBox(width: 16),
        Expanded(child: Text('Notifications', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary))),
        if (hasUnread)
          GestureDetector(
            onTap: _markAllAsRead,
            child: Text('Mark all read', style: AppTextStyles.link),
          ),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildEmptyState() {
    final colors = AppColors.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 80),
      child: Column(
        children: [
          Icon(Icons.notifications_none, color: colors.textSecondary, size: 40),
          const SizedBox(height: 12),
          Text('You\'re all caught up', style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
        ],
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final NotificationItem item;
  final VoidCallback onTap;

  const _NotificationTile({required this.item, required this.onTap});

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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: colors.background,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(item.type.icon, color: item.type.color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.title,
                            style: AppTextStyles.body.copyWith(
                              fontWeight: item.isRead ? FontWeight.w400 : FontWeight.w600,
                              color: colors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(item.timeLabel, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.body,
                      style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (!item.isRead)
                Padding(
                  padding: const EdgeInsets.only(left: 8, top: 4),
                  child: Container(
                    height: 8,
                    width: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.primaryGold,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
