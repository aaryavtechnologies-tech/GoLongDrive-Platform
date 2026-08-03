// lib/models/notification_item.dart
import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';

/// Category of a notification — drives which icon/color is shown.
enum NotificationType { ride, promo, account, system }

extension NotificationTypeInfo on NotificationType {
  IconData get icon {
    switch (this) {
      case NotificationType.ride:
        return Icons.directions_car_filled_outlined;
      case NotificationType.promo:
        return Icons.local_offer_outlined;
      case NotificationType.account:
        return Icons.person_outline;
      case NotificationType.system:
        return Icons.info_outline;
    }
  }

  Color get color {
    switch (this) {
      case NotificationType.ride:
        return AppColors.primaryGold;
      case NotificationType.promo:
        return AppColors.success;
      case NotificationType.account:
        return AppColors.textPrimary;
      case NotificationType.system:
        return AppColors.textSecondary;
    }
  }
}

/// A single notification/inbox row.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only — `NotificationsScreen` seeds itself from `_mockNotifications`
/// in its own State, and "read" state is only kept in local `setState`
/// (lost on screen close). To wire this up:
///   1. `GET /api/notifications` -> `List<NotificationItem>`. Natural home:
///      `lib/core/data/notification_service.dart`.
///   2. For real-time delivery, this is also where push (FCM/APNs) would be
///      wired — incoming pushes should upsert into the same list this
///      screen renders, not a separate code path.
///   3. Tapping an unread notification -> `POST /api/notifications/{id}/read`
///      (currently just flips `isRead` in local state — see
///      `_markAsRead()` in `notifications_screen.dart`).
///   4. "Mark all as read" -> `POST /api/notifications/read-all`.
///   5. Deep-linking: a ride notification should eventually navigate to
///      that ride's details (see the TODO in ride_history_item.dart) —
///      `relatedRideId` below is a placeholder for that hookup.
/// ===========================================================================
class NotificationItem {
  final String id;
  final NotificationType type;
  final String title;
  final String body;
  final String timeLabel; // display string, e.g. "2h ago"
  final bool isRead;
  final String? relatedRideId;

  const NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.timeLabel,
    this.isRead = false,
    this.relatedRideId,
  });

  NotificationItem copyWith({bool? isRead}) {
    return NotificationItem(
      id: id,
      type: type,
      title: title,
      body: body,
      timeLabel: timeLabel,
      isRead: isRead ?? this.isRead,
      relatedRideId: relatedRideId,
    );
  }
}
