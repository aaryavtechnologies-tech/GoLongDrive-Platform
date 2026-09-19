import 'dart:convert';
import '../core/data/api_service.dart';

class DriverTourPackageService {
  Future<List<Map<String, dynamic>>> getUnassignedPackages() async {
    final response = await ApiService.get('/driver/rides/available-packages');
    final responseData = jsonDecode(response.body);
    if (responseData['success'] == true && responseData['data'] != null) {
      return List<Map<String, dynamic>>.from(responseData['data']);
    }
    return [];
  }

  Future<void> acceptTourPackage(String bookingId) async {
    final response = await ApiService.post('/driver/rides/$bookingId/accept', body: {});
    final responseData = jsonDecode(response.body);
    if (responseData['success'] != true) {
      throw Exception(responseData['message'] ?? 'Failed to accept tour package');
    }
  }
}
