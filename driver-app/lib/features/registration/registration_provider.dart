import 'package:flutter/foundation.dart';

/// Replaces the Zustand `useRegistrationStore`. Holds form data across all
/// 9 wizard steps so each step widget can read/update it via Provider.
class RegistrationData extends ChangeNotifier {
  int currentStep = 1;
  static const totalSteps = 9;

  // --- Auth Token ---
  String? jwtToken;

  // --- Step 1: Personal ---
  String fullName = '';
  String phone = '';
  String email = '';
  String dateOfBirth = ''; // DD/MM/YYYY

  // --- Step 2: Address ---
  String street = '';
  String city = '';
  String state = '';
  String pincode = '';

  // --- Step 3: Account ---
  String password = '';
  String confirmPassword = '';
  bool acceptedTerms = false;

  // --- Step 4: Vehicle basic ---
  String vehicleBrand = '';
  String vehicleModel = '';
  String registrationNumber = '';
  String vehicleType = ''; // Hatchback/Sedan/SUV/MUV/Luxury

  // --- Step 5: Vehicle specs ---
  String fuelType = ''; // Petrol/Diesel/CNG/Electric
  String manufacturingYear = '';
  String seatingCapacity = '';
  String acAvailable = ''; // Yes/No

  // --- Step 6 & 7: Documents (image file paths) ---
  String? aadhaarFront, aadhaarBack;
  String? licenseFront, licenseBack;
  String? rcFront, rcBack;
  String? insuranceCertificate, pucCertificate;

  // --- Step 8: Photos ---
  String? profilePhoto, selfiePhoto, vehicleFrontPhoto;

  void goToStep(int step) {
    currentStep = step.clamp(1, totalSteps);
    notifyListeners();
  }

  void nextStep() => goToStep(currentStep + 1);
  void previousStep() => goToStep(currentStep - 1);

  void update(VoidCallback mutation) {
    mutation();
    notifyListeners();
  }
}
