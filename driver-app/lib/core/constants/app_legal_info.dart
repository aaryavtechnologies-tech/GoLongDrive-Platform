// lib/core/constants/app_legal_info.dart

/// Central legal and publisher configuration for the GoLongDrive Driver application.
/// Used across Privacy Policy screens, In-App Disclosures, and Legal links.
class AppLegalInfo {
  AppLegalInfo._();

  static const String appName = 'GoLongDrive Driver';
  
  // Real Android application ID from build.gradle.kts
  static const String packageName = 'com.example.golongdrive';

  // Publisher on Google Play
  // NOTE: CHANGE after transfer to "Growth Nations"
  static const String publisherName = 'ETCHTECH GLOBAL SOLUTIONS LLP';

  // Registered Publisher Address
  // NOTE: Change after transfer to "Near Raj Hotel, Bavisa Faliya, Silvassa - 396230, India"
  static const String publisherAddress =
      '1st Floor, 581, D1, Atrium Coworks, Anna Salai, Teynampet, Chennai - 600006, India';

  // Technical Operator and Developer
  static const String operatorName = 'Aaryav Technologies';
  static const String operatorAddress =
      'Near Raj Hotel, Bavisa Faliya, Silvassa - 396230, India';

  // Support & Grievance Contact
  static const String supportEmail = 'support@golongdrive.online';

  // Official URLs
  static const String privacyPolicyUrl =
      'https://golongdrive.online/driver-policy';
  static const String accountDeletionUrl =
      'https://golongdrive.online/account-deletion';
  static const String officialWebsite = 'https://golongdrive.online';
}

