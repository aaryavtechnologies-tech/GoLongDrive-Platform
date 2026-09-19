import 'dart:convert';
import '../data/api_client.dart';
import '../../models/tour_package.dart';

class TourPackageService {
  Future<List<TourPackage>> getTourPackages() async {
    final response = await ApiClient.get('/tour-packages');
    final responseData = jsonDecode(response.body);
    if (responseData['success'] == true && responseData['data'] != null) {
      final List<dynamic> data = responseData['data'];
      return data.map((json) => TourPackage.fromJson(json)).toList();
    }
    return [];
  }

  Future<TourPackage> getTourPackageById(String id) async {
    final response = await ApiClient.get('/tour-packages/$id');
    final responseData = jsonDecode(response.body);
    if (responseData['success'] == true && responseData['data'] != null) {
      return TourPackage.fromJson(responseData['data']);
    }
    throw Exception('Failed to load tour package');
  }

  Future<void> bookTourPackage(Map<String, dynamic> bookingData) async {
    final response = await ApiClient.post('/customer/bookings/tour-package', body: bookingData);
    final responseData = jsonDecode(response.body);
    if (responseData['success'] != true) {
      throw Exception(responseData['message'] ?? 'Failed to book tour package');
    }
  }

  Future<void> suggestCustomTour(Map<String, dynamic> suggestionData) async {
    final response = await ApiClient.post('/tour-packages/suggest', body: suggestionData);
    final responseData = jsonDecode(response.body);
    if (responseData['success'] != true) {
      throw Exception(responseData['message'] ?? 'Failed to submit suggestion');
    }
  }
}
