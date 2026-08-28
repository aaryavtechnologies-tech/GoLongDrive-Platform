import 'dart:convert';
import 'api_service.dart';

class VehicleService {
  static Future<List<Map<String, dynamic>>> getVehicleTypes() async {
    try {
      final response = await ApiService.get('/driver/vehicle-types');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] != null && data['data']['vehicleTypes'] != null) {
          return List<Map<String, dynamic>>.from(data['data']['vehicleTypes']);
        }
      }
      return [];
    } catch (e) {
      print('Error fetching vehicle types: $e');
      return [];
    }
  }
}
