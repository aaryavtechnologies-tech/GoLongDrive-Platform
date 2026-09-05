import 'dart:convert';
import '../data/api_client.dart';
import '../../models/notification_item.dart';

class NotificationService {
  /// Fetches the user's notifications
  static Future<List<NotificationItem>> getMyNotifications() async {
    try {
      final response = await ApiClient.get('/notifications');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List<dynamic> data = body['data']['notifications'] ?? [];
        
        return data.map((json) {
          NotificationType type;
          switch (json['notificationType']) {
            case 'Ride Assigned':
            case 'Ride Cancelled':
            case 'Ride Status':
              type = NotificationType.ride;
              break;
            case 'Payment Success':
            case 'Payment Failed':
              type = NotificationType.payment;
              break;
            case 'System Notification':
            default:
              type = NotificationType.system;
              break;
          }

          return NotificationItem(
            id: json['_id'],
            type: type,
            title: json['title'] ?? 'Notification',
            body: json['message'] ?? '',
            timeLabel: _formatDate(json['createdAt']),
            isRead: json['isRead'] ?? false,
            relatedRideId: json['relatedId'],
          );
        }).toList();
      } else {
        throw Exception('Failed to get notifications');
      }
    } catch (e) {
      return [];
    }
  }

  /// Marks a single notification as read
  static Future<void> markAsRead(String id) async {
    try {
      await ApiClient.patch('/notifications/$id/read', body: {});
    } catch (_) {}
  }

  /// Marks all notifications as read
  /// (assuming backend doesn't have read-all, we might need to implement it later
  /// or do multiple calls. For MVP we will just let it fail silently if not supported)
  static Future<void> markAllAsRead() async {
    // Currently backend doesn't seem to have a read-all endpoint.
  }

  static String _formatDate(String? isoDate) {
    if (isoDate == null) return '';
    try {
      final date = DateTime.parse(isoDate);
      final now = DateTime.now();
      final diff = now.difference(date);
      if (diff.inDays > 7) return '${date.day}/${date.month}/${date.year}';
      if (diff.inDays > 0) return '${diff.inDays}d ago';
      if (diff.inHours > 0) return '${diff.inHours}h ago';
      if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
      return 'Just now';
    } catch (_) {
      return '';
    }
  }
}
