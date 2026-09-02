import 'dart:async';
import 'package:audioplayers/audioplayers.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/env_config.dart';
import 'auth_service.dart';

/// SocketService — manages the persistent WebSocket connection for the driver app.
///
/// Key events:
///   ride:request       → A new ride request has been broadcast to this driver
///   ride:request_taken → Another driver accepted the same request (dismiss screen)
///
/// Usage:
///   await SocketService.init();   // call from dashboard on login / go-online
///   SocketService.disconnect();   // call on logout / go-offline (optional)
class SocketService {
  static io.Socket? _socket;
  static final AudioPlayer _audioPlayer = AudioPlayer();

  // ── Streams ─────────────────────────────────────────────────────────────────

  /// Emits the booking Map when a new ride request is received for this driver
  static final StreamController<Map<String, dynamic>> _rideRequestController =
      StreamController.broadcast();
  static Stream<Map<String, dynamic>> get onRideRequest =>
      _rideRequestController.stream;

  /// Emits a bookingId string when another driver takes the same broadcasted ride
  static final StreamController<String> _rideTakenController =
      StreamController.broadcast();
  static Stream<String> get onRideTaken => _rideTakenController.stream;

  // ── Reconnect state ──────────────────────────────────────────────────────────
  static bool _intentionalDisconnect = false;
  static int _reconnectDelaySeconds = 2;
  static Timer? _reconnectTimer;
  static bool _isInitializing = false;

  // ── Public API ───────────────────────────────────────────────────────────────

  static bool get isConnected => _socket?.connected ?? false;

  /// Initialise and connect the socket. Safe to call multiple times.
  static Future<void> init() async {
    if (_socket != null) {
      if (!_socket!.connected) _socket!.connect();
      return;
    }
    if (_isInitializing) return;
    _isInitializing = true;

    try {
      final token = await AuthService.getToken();
      final driverId = await AuthService.getUserId();

    if (token == null || driverId == null) {
      print('SocketService: No auth token or driverId — skipping init');
      return;
    }

    _intentionalDisconnect = false;

    _socket = io.io(
      EnvConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .build(),
    );

    _socket!.connect();

    // ── Connection events ──────────────────────────────────────────────────────

    _socket!.onConnect((_) {
      print('✅ SocketService connected: ${_socket!.id}');
      _reconnectDelaySeconds = 2; // reset back-off on successful connect
      // Register this driver so the server can target them
      _socket!.emit('driver:join', {'driverId': driverId});
    });

    _socket!.onDisconnect((_) {
      print('❌ SocketService disconnected');
      if (!_intentionalDisconnect) _scheduleReconnect();
    });

    _socket!.onConnectError((err) {
      print('⚠️  SocketService connect error: $err');
      if (!_intentionalDisconnect) _scheduleReconnect();
    });

    // ── Ride events ────────────────────────────────────────────────────────────

    /// New ride request broadcast — show IncomingRequestScreen + play sound
    _socket!.on('ride:request', (data) {
      print('📥 ride:request received: $data');
      final booking = data is Map ? (data['booking'] ?? data) : null;
      if (booking != null) {
        _playRequestSound();
        _rideRequestController.add(Map<String, dynamic>.from(booking));
      }
    });

    /// Another driver accepted the same ride — dismiss IncomingRequestScreen
    _socket!.on('ride:request_taken', (data) {
      print('📥 ride:request_taken: $data');
      final bookingId = data is Map ? data['bookingId']?.toString() : null;
      if (bookingId != null) {
        _rideTakenController.add(bookingId);
      }
    });
    } finally {
      _isInitializing = false;
    }
  }

  /// Gracefully disconnect — call on logout or going offline
  static void disconnect() {
    _intentionalDisconnect = true;
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _socket?.disconnect();
    _socket = null;
    print('SocketService: intentionally disconnected');
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  /// Exponential back-off reconnect (2s → 4s → 8s → max 30s)
  static void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(Duration(seconds: _reconnectDelaySeconds), () async {
      print('🔄 SocketService: reconnecting...');
      _reconnectDelaySeconds = (_reconnectDelaySeconds * 2).clamp(2, 30);
      _socket?.connect();
    });
  }

  /// Play the ride-request notification sound
  static Future<void> _playRequestSound() async {
    try {
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource('sounds/ride_request.mp3'));
    } catch (e) {
      print('SocketService: audio play error: $e');
    }
  }
}
