import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/env_config.dart';
import 'auth_service.dart';

class SocketService {
  static io.Socket? _socket;
  
  // Stream controller to broadcast ride requests to the UI
  static final StreamController<Map<String, dynamic>> _rideRequestController = StreamController.broadcast();
  static Stream<Map<String, dynamic>> get onRideRequest => _rideRequestController.stream;

  // Stream controller for ride accepted events (when someone else wins)
  static final StreamController<String> _rideAcceptedController = StreamController.broadcast();
  static Stream<String> get onRideAccepted => _rideAcceptedController.stream;

  static Future<void> init() async {
    if (_socket != null && _socket!.connected) return;

    final token = await AuthService.getToken();
    final driverId = await AuthService.getUserId();
    
    if (token == null || driverId == null) return;

    _socket = io.io(
      EnvConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      print('Socket Connected: ${_socket!.id}');
      // Register this driver to receive requests
      _socket!.emit('driver:join', {'driverId': driverId});
    });

    _socket!.on('ride:request', (data) {
      print('Received ride:request: $data');
      if (data['booking'] != null) {
        _rideRequestController.add(data['booking']);
      }
    });

    _socket!.on('ride:accepted', (data) {
      print('Received ride:accepted: $data');
      if (data['bookingId'] != null) {
        _rideAcceptedController.add(data['bookingId'].toString());
      }
    });

    _socket!.onDisconnect((_) {
      print('Socket Disconnected');
    });
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
