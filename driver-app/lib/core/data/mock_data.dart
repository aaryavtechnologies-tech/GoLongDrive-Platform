import '../models/ride.dart';

/// Simple earnings transaction — used by the Earnings tab's history list.
class Transaction {
  final String id;
  final String title;
  final double amount;
  final DateTime dateTime;
  final bool isCredit;

  const Transaction({
    required this.id,
    required this.title,
    required this.amount,
    required this.dateTime,
    this.isCredit = true,
  });
}

/// Driver profile — used by the Profile tab and Dashboard header.
class DriverProfile {
  final String name;
  final String phone;
  final String email;
  final double rating;
  final int totalTrips;
  final String vehicleModel;
  final String vehicleNumber;
  final DateTime memberSince;

  const DriverProfile({
    required this.name,
    required this.phone,
    required this.email,
    required this.rating,
    required this.totalTrips,
    required this.vehicleModel,
    required this.vehicleNumber,
    required this.memberSince,
  });
}

/// Centralized mock data for frontend development.
/// BACKEND DEV: Use these classes and fields as the source of truth for the API response shapes.
/// Every screen in the app depends on this MockData class for now.
class MockData {
  MockData._();

  // Replace with GET /driver/profile
  static final driverProfile = DriverProfile(
    name: 'Rahul Kumar',
    phone: '+91 98765 43210',
    email: 'rahul.kumar@example.com',
    rating: 4.8,
    totalTrips: 342,
    vehicleModel: 'Toyota Innova Crysta',
    vehicleNumber: 'KA 01 AB 1234',
    memberSince: DateTime(2023, 3, 14),
  );

  // Replace with GET /rides
  static final rides = <Ride>[
    // ... (rest of the rides list)
    Ride(
      id: 'RD-1042',
      status: RideStatus.ongoing,
      pickupAddress: 'MG Road Metro Station',
      dropAddress: 'Koramangala 5th Block',
      customerName: 'Ananya Sharma',
      customerPhone: '+91 90000 11122',
      customerRating: 4.9,
      fare: 340,
      distanceKm: 8.4,
      durationMin: 22,
      dateTime: DateTime.now().subtract(const Duration(minutes: 5)),
      vehicleModel: 'Toyota Innova Crysta',
      vehicleNumber: 'KA 01 AB 1234',
      paymentMethod: 'UPI',
      // MG Road Metro Station -> Koramangala 5th Block (Bengaluru)
      pickupLat: 12.9757,
      pickupLng: 77.6079,
      dropLat: 12.9352,
      dropLng: 77.6146,
    ),
    Ride(
      id: 'RD-1041',
      status: RideStatus.upcoming,
      pickupAddress: 'Indiranagar 100ft Road',
      dropAddress: 'Kempegowda International Airport',
      customerName: 'Vikram Rao',
      customerPhone: '+91 90000 22233',
      customerRating: 4.6,
      fare: 980,
      distanceKm: 36.2,
      durationMin: 55,
      dateTime: DateTime.now().add(const Duration(hours: 2)),
      vehicleModel: 'Toyota Innova Crysta',
      vehicleNumber: 'KA 01 AB 1234',
      paymentMethod: 'Cash',
      // Indiranagar 100ft Road -> Kempegowda International Airport
      pickupLat: 12.9719,
      pickupLng: 77.6412,
      dropLat: 13.1986,
      dropLng: 77.7066,
    ),
    Ride(
      id: 'RD-1038',
      status: RideStatus.completed,
      pickupAddress: 'HSR Layout Sector 2',
      dropAddress: 'Electronic City Phase 1',
      customerName: 'Priya Menon',
      customerPhone: '+91 90000 33344',
      customerRating: 5.0,
      fare: 410,
      distanceKm: 14.1,
      durationMin: 28,
      dateTime: DateTime.now().subtract(const Duration(hours: 5)),
      vehicleModel: 'Toyota Innova Crysta',
      vehicleNumber: 'KA 01 AB 1234',
      paymentMethod: 'UPI',
      // HSR Layout Sector 2 -> Electronic City Phase 1 (Bengaluru)
      pickupLat: 12.9116,
      pickupLng: 77.6389,
      dropLat: 12.8465,
      dropLng: 77.6711,
    ),
    Ride(
      id: 'RD-1035',
      status: RideStatus.completed,
      pickupAddress: 'Whitefield ITPL Main Road',
      dropAddress: 'Marathahalli Bridge',
      customerName: 'Karan Mehta',
      customerPhone: '+91 90000 44455',
      customerRating: 4.7,
      fare: 260,
      distanceKm: 9.8,
      durationMin: 19,
      dateTime: DateTime.now().subtract(const Duration(days: 1, hours: 3)),
      vehicleModel: 'Toyota Innova Crysta',
      vehicleNumber: 'KA 01 AB 1234',
      paymentMethod: 'Cash',
      // Whitefield ITPL Main Road -> Marathahalli Bridge (Bengaluru)
      pickupLat: 12.9676,
      pickupLng: 77.7151,
      dropLat: 12.9567,
      dropLng: 77.7012,
    ),
    Ride(
      id: 'RD-1030',
      status: RideStatus.cancelled,
      pickupAddress: 'Jayanagar 4th Block',
      dropAddress: 'Banashankari Temple',
      customerName: 'Sneha Iyer',
      customerPhone: '+91 90000 55566',
      customerRating: 4.5,
      fare: 0,
      distanceKm: 6.2,
      durationMin: 0,
      dateTime: DateTime.now().subtract(const Duration(days: 2)),
      vehicleModel: 'Toyota Innova Crysta',
      vehicleNumber: 'KA 01 AB 1234',
      paymentMethod: 'Cash',
      // Jayanagar 4th Block -> Banashankari Temple (Bengaluru)
      pickupLat: 12.9275,
      pickupLng: 77.5828,
      dropLat: 12.9156,
      dropLng: 77.5736,
    ),
  ];

  static Ride? get currentRide {
    for (final ride in rides) {
      if (ride.status == RideStatus.ongoing) return ride;
    }
    return null;
  }

  static List<Ride> get upcomingRides => rides.where((r) => r.status == RideStatus.upcoming).toList();

  static List<Ride> get completedRides => rides.where((r) => r.status == RideStatus.completed).toList();

  static final transactions = <Transaction>[
    Transaction(
      id: 'TXN-501',
      title: 'Ride earning — RD-1038',
      amount: 410,
      dateTime: DateTime.now().subtract(const Duration(hours: 5)),
    ),
    Transaction(
      id: 'TXN-500',
      title: 'Ride earning — RD-1035',
      amount: 260,
      dateTime: DateTime.now().subtract(const Duration(days: 1, hours: 3)),
    ),
    Transaction(
      id: 'TXN-499',
      title: 'Weekly bonus',
      amount: 500,
      dateTime: DateTime.now().subtract(const Duration(days: 2)),
    ),
    Transaction(
      id: 'TXN-498',
      title: 'Withdrawal to bank',
      amount: 3200,
      dateTime: DateTime.now().subtract(const Duration(days: 3)),
      isCredit: false,
    ),
  ];

  static double get todayEarnings => 840;
  static double get weekEarnings => 5460;
  static double get monthEarnings => 21800;
  static int get tripsToday => 6;
}
