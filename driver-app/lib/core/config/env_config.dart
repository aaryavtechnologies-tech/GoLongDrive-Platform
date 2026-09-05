import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  static String get apiUrl => dotenv.env['API_BASE_URL'] ?? 'https://api.golongdrive.online/api/v1';
  static String get socketUrl => dotenv.env['SOCKET_URL'] ?? 'https://api.golongdrive.online';
}
