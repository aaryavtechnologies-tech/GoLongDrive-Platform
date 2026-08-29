// lib/core/services/socket_service.dart
//
// User-app Socket.io service.
// Connects to the backend, registers the customer, and streams real-time
// booking events (driver assignment, cancellations, etc.) to the UI.
//
// Usage:
//   await UserSocketService.init(customerId);   // call after login
//   UserSocketService.onDriverAssigned.listen(…); // subscribe in a widget
//   UserSocketService.dispose();                // call on logout

import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'auth_service.dart';

class UserSocketService {
  static const String _socketUrl = 'https://api.golongdrive.online';

  static io.Socket? _socket;
  static bool _intentionalDisconnect = false;
  static int _reconnectDelay = 2;
  static Timer? _reconnectTimer;

  // ── Event streams ──────────────────────────────────────────────────────────

  /// Emits when a driver is assigned to the user's booking.
  /// Payload: { bookingId, rideStatus, driver: { id, fullName, phoneNumber, profileImage, vehicle } }
  static final StreamController<Map<String, dynamic>> _driverAssignedCtrl =
      StreamController.broadcast();
  static Stream<Map<String, dynamic>> get onDriverAssigned =>
      _driverAssignedCtrl.stream;

  /// Emits when no driver is available.
  /// Payload: { bookingId, message }
  static final StreamController<Map<String, dynamic>> _noDriverCtrl =
      StreamController.broadcast();
  static Stream<Map<String, dynamic>> get onNoDriver => _noDriverCtrl.stream;

  /// Emits when the booking status changes (general purpose).
  /// Payload: { bookingId, status, ... }
  static final StreamController<Map<String, dynamic>> _statusUpdateCtrl =
      StreamController.broadcast();
  static Stream<Map<String, dynamic>> get onStatusUpdate =>
      _statusUpdateCtrl.stream;

  // ── Public API ─────────────────────────────────────────────────────────────

  static bool get isConnected => _socket?.connected ?? false;

  /// Connect and register the customer on the backend socket.
  static Future<void> init() async {
    if (_socket != null && _socket!.connected) return;

    final token = await AuthService.getToken();
    final customerId = await AuthService.getUserId();

    if (token == null || customerId == null) {
      print('UserSocketService: No auth — skipping socket init');
      return;
    }

    _intentionalDisconnect = false;

    _socket = io.io(
      _socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      print('✅ UserSocketService connected: ${_socket!.id}');
      _reconnectDelay = 2;
      // Register this customer so backend can target them
      _socket!.emit('customer:join', {'customerId': customerId});
    });

    _socket!.onDisconnect((_) {
      print('❌ UserSocketService disconnected');
      if (!_intentionalDisconnect) _scheduleReconnect();
    });

    _socket!.onConnectError((err) {
      print('⚠️  UserSocketService connect error: $err');
      if (!_intentionalDisconnect) _scheduleReconnect();
    });

    // ── Events ───────────────────────────────────────────────────────────────

    /// Driver successfully assigned — update the UI immediately
    _socket!.on('booking:driver_assigned', (data) {
      print('📥 booking:driver_assigned: $data');
      if (data is Map) {
        _driverAssignedCtrl.add(Map<String, dynamic>.from(data));
      }
    });

    /// No driver found — tell user to wait
    _socket!.on('booking:no_driver', (data) {
      print('📥 booking:no_driver: $data');
      if (data is Map) {
        _noDriverCtrl.add(Map<String, dynamic>.from(data));
      }
    });

    /// General booking status updates (started, completed, cancelled)
    _socket!.on('booking:status_update', (data) {
      print('📥 booking:status_update: $data');
      if (data is Map) {
        _statusUpdateCtrl.add(Map<String, dynamic>.from(data));
      }
    });
  }

  /// Disconnect cleanly (on logout)
  static void dispose() {
    _intentionalDisconnect = true;
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _socket?.disconnect();
    _socket = null;
    print('UserSocketService: disposed');
  }

  // ── Private ────────────────────────────────────────────────────────────────

  static void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(Duration(seconds: _reconnectDelay), () {
      print('🔄 UserSocketService: reconnecting...');
      _reconnectDelay = (_reconnectDelay * 2).clamp(2, 30);
      _socket?.connect();
    });
  }
}
