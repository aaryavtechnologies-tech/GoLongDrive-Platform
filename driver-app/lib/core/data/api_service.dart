import 'dart:async';
import 'dart:convert';
import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/env_config.dart';
import 'auth_service.dart';

class ApiService {
  static String get baseUrl => EnvConfig.apiUrl;
  static const Duration timeoutDuration = Duration(seconds: 30);
  static int _requestCounter = 0;

  static Future<Map<String, String>> _getHeaders({Map<String, String>? extraHeaders}) async {
    final token = await AuthService.getToken();
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }
    return headers;
  }

  static String _prettyJson(dynamic data) {
    if (data == null) return 'null';
    try {
      if (data is String) {
        final decoded = jsonDecode(data);
        return const JsonEncoder.withIndent('  ').convert(decoded);
      }
      return const JsonEncoder.withIndent('  ').convert(data);
    } catch (_) {
      return data.toString();
    }
  }

  static String _maskToken(String? token) {
    if (token == null || token.isEmpty) return 'none';
    if (token.length <= 12) return '***';
    return '${token.substring(0, 6)}...${token.substring(token.length - 4)}';
  }

  static void _logRequest(int id, String method, Uri url, Map<String, String> headers, dynamic body) {
    final authHeader = headers['Authorization'];
    final maskedAuth = authHeader != null ? 'Bearer ${_maskToken(authHeader.replaceFirst('Bearer ', ''))}' : 'None';

    final buffer = StringBuffer();
    buffer.writeln('╔══════════════════════════════════════════════════════════════════════');
    buffer.writeln('║ 🚀 [API REQUEST #$id] $method');
    buffer.writeln('║ 🌐 URL:     $url');
    buffer.writeln('║ 🔑 AUTH:    $maskedAuth');
    if (body != null) {
      buffer.writeln('║ 📦 BODY:');
      final lines = _prettyJson(body).split('\n');
      for (final line in lines) {
        buffer.writeln('║    $line');
      }
    } else {
      buffer.writeln('║ 📦 BODY:    (empty)');
    }
    buffer.write('╚══════════════════════════════════════════════════════════════════════');

    final logMessage = buffer.toString();
    debugPrint(logMessage);
    developer.log(logMessage, name: 'ApiService');
  }

  static void _logResponse(int id, String method, Uri url, http.Response response, int durationMs) {
    final isSuccess = response.statusCode >= 200 && response.statusCode < 300;
    final icon = isSuccess ? '✅' : '⚠️';
    final statusText = '$icon ${response.statusCode} ${response.reasonPhrase ?? ''}';

    final buffer = StringBuffer();
    buffer.writeln('┌──────────────────────────────────────────────────────────────────────');
    buffer.writeln('│ $icon [API RESPONSE #$id] ($durationMs ms) -> $statusText');
    buffer.writeln('│ 🌐 URL:     $method $url');
    buffer.writeln('│ 📄 BODY:');
    try {
      final lines = _prettyJson(response.body).split('\n');
      for (final line in lines) {
        buffer.writeln('│    $line');
      }
    } catch (_) {
      buffer.writeln('│    ${response.body}');
    }
    buffer.write('└──────────────────────────────────────────────────────────────────────');

    final logMessage = buffer.toString();
    debugPrint(logMessage);
    developer.log(logMessage, name: 'ApiService');
  }

  static void _logError(int id, String method, Uri url, Object error, StackTrace? stackTrace, int durationMs) {
    final buffer = StringBuffer();
    buffer.writeln('┌──────────────────────────────────────────────────────────────────────');
    buffer.writeln('│ ❌ [API ERROR #$id] ($durationMs ms)');
    buffer.writeln('│ 🌐 URL:     $method $url');
    buffer.writeln('│ 💥 ERROR:   $error');
    if (stackTrace != null) {
      buffer.writeln('│ 📍 TRACE:   $stackTrace');
    }
    buffer.write('└──────────────────────────────────────────────────────────────────────');

    final logMessage = buffer.toString();
    debugPrint(logMessage);
    developer.log(logMessage, name: 'ApiService', error: error, stackTrace: stackTrace);
  }

  static Uri _resolveUri(String endpoint) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return Uri.parse(endpoint);
    }
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    return Uri.parse('$baseUrl$cleanEndpoint');
  }

  static Future<http.Response> get(String endpoint, {Map<String, String>? extraHeaders}) async {
    final id = ++_requestCounter;
    final url = _resolveUri(endpoint);
    final headers = await _getHeaders(extraHeaders: extraHeaders);
    _logRequest(id, 'GET', url, headers, null);

    final stopwatch = Stopwatch()..start();
    try {
      final response = await http.get(url, headers: headers).timeout(timeoutDuration);
      stopwatch.stop();
      _logResponse(id, 'GET', url, response, stopwatch.elapsedMilliseconds);
      return response;
    } catch (e, stack) {
      stopwatch.stop();
      _logError(id, 'GET', url, e, stack, stopwatch.elapsedMilliseconds);
      rethrow;
    }
  }

  static Future<http.Response> post(String endpoint, {Map<String, dynamic>? body, Map<String, String>? extraHeaders}) async {
    final id = ++_requestCounter;
    final url = _resolveUri(endpoint);
    final headers = await _getHeaders(extraHeaders: extraHeaders);
    _logRequest(id, 'POST', url, headers, body);

    final stopwatch = Stopwatch()..start();
    try {
      final response = await http.post(
        url,
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(timeoutDuration);
      stopwatch.stop();
      _logResponse(id, 'POST', url, response, stopwatch.elapsedMilliseconds);
      return response;
    } catch (e, stack) {
      stopwatch.stop();
      _logError(id, 'POST', url, e, stack, stopwatch.elapsedMilliseconds);
      rethrow;
    }
  }

  static Future<http.Response> patch(String endpoint, {Map<String, dynamic>? body, Map<String, String>? extraHeaders}) async {
    final id = ++_requestCounter;
    final url = _resolveUri(endpoint);
    final headers = await _getHeaders(extraHeaders: extraHeaders);
    _logRequest(id, 'PATCH', url, headers, body);

    final stopwatch = Stopwatch()..start();
    try {
      final response = await http.patch(
        url,
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(timeoutDuration);
      stopwatch.stop();
      _logResponse(id, 'PATCH', url, response, stopwatch.elapsedMilliseconds);
      return response;
    } catch (e, stack) {
      stopwatch.stop();
      _logError(id, 'PATCH', url, e, stack, stopwatch.elapsedMilliseconds);
      rethrow;
    }
  }

  static Future<http.Response> put(String endpoint, {Map<String, dynamic>? body, Map<String, String>? extraHeaders}) async {
    final id = ++_requestCounter;
    final url = _resolveUri(endpoint);
    final headers = await _getHeaders(extraHeaders: extraHeaders);
    _logRequest(id, 'PUT', url, headers, body);

    final stopwatch = Stopwatch()..start();
    try {
      final response = await http.put(
        url,
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(timeoutDuration);
      stopwatch.stop();
      _logResponse(id, 'PUT', url, response, stopwatch.elapsedMilliseconds);
      return response;
    } catch (e, stack) {
      stopwatch.stop();
      _logError(id, 'PUT', url, e, stack, stopwatch.elapsedMilliseconds);
      rethrow;
    }
  }

  static Future<http.Response> delete(String endpoint, {Map<String, dynamic>? body, Map<String, String>? extraHeaders}) async {
    final id = ++_requestCounter;
    final url = _resolveUri(endpoint);
    final headers = await _getHeaders(extraHeaders: extraHeaders);
    _logRequest(id, 'DELETE', url, headers, body);

    final stopwatch = Stopwatch()..start();
    try {
      final response = await http.delete(
        url,
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(timeoutDuration);
      stopwatch.stop();
      _logResponse(id, 'DELETE', url, response, stopwatch.elapsedMilliseconds);
      return response;
    } catch (e, stack) {
      stopwatch.stop();
      _logError(id, 'DELETE', url, e, stack, stopwatch.elapsedMilliseconds);
      rethrow;
    }
  }
}
