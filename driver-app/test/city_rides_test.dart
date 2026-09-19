import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golongdrive/features/city_rides/city_ride_model.dart';
import 'package:golongdrive/features/city_rides/city_rides_screen.dart';
import 'package:golongdrive/features/city_rides/city_rides_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final service = CityRidesService.instance;
    service.activeRide.value = null;
    service.completedRides.value = [];
    await service.refreshIncomingRequests();
  });

  test('maps a live API city ride without exposing its PIN', () {
    final ride = CityRideRequest.fromApiJson({
      '_id': 'api-id',
      'bookingId': 'CR-100',
      'bookingType': 'local',
      'customer': {'fullName': 'API Rider'},
      'pickupAddress': 'Pickup address',
      'dropAddress': 'Drop address',
      'pickupLat': 23.1,
      'pickupLng': 72.1,
      'destinationLat': 23.2,
      'destinationLng': 72.2,
      'estimatedDistance': 7.5,
      'estimatedFare': 250,
      'rideStatus': 'Searching Driver',
      'createdAt': '2026-09-19T10:00:00.000Z',
    });

    expect(ride.riderName, 'API Rider');
    expect(ride.pickupAddress, 'Pickup address');
    expect(ride.status, CityRideStatus.pending);
    expect(ride.ridePin, isEmpty);
    expect(ride.isDemo, isFalse);
  });

  testWidgets('driver can complete the City Rides demo flow', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: CityRidesScreen()),
    );
    await tester.pump();

    expect(find.text('City Rides'), findsOneWidget);
    expect(find.text('Priya Sharma'), findsOneWidget);
    expect(CityRidesService.instance.incomingRequests.value, hasLength(7));
    expect(find.text('Accept Ride'), findsWidgets);

    await tester.tap(find.text('Accept Ride').first);
    await tester.pumpAndSettle();
    expect(find.text('Heading to Pickup'), findsOneWidget);

    await tester.ensureVisible(find.text('I Have Arrived'));
    await tester.tap(find.text('I Have Arrived'));
    await tester.pumpAndSettle();
    expect(find.text('Passenger PIN: 4821'), findsOneWidget);

    for (final digit in ['4', '8', '2', '1']) {
      final key = find.widgetWithText(TextButton, digit);
      await tester.ensureVisible(key);
      await tester.pumpAndSettle();
      await tester.tap(key);
      await tester.pump();
    }
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pump();
    expect(find.text('Trip in Progress'), findsWidgets);

    await tester.ensureVisible(find.text('Complete Ride'));
    await tester.tap(find.text('Complete Ride'));
    await tester.pumpAndSettle();
    expect(find.text('City Ride Completed!'), findsOneWidget);
    expect(find.text('₹165'), findsOneWidget);

    final completed = CityRidesService.instance.completedRides.value;
    expect(completed, hasLength(1));
    expect(completed.single.status, CityRideStatus.completed);
  });
}
