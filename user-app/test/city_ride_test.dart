import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:project/core/theme/app_theme.dart';
import 'package:project/screens/city_ride/city_ride_screen.dart';
import 'package:project/screens/city_ride/city_ride_entry.dart';
import 'package:project/routes/app_routes.dart';

void main() {
  setUpAll(() async {
    final loader = FontLoader('Inter')
      ..addFont(rootBundle.load('assets/fonts/Inter-Regular.ttf'));
    await loader.load();
    final icons = FontLoader('MaterialIcons')
      ..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'));
    await icons.load();
  });
  Future<void> open(WidgetTester tester,
      {bool dark = false, double width = 390, double scale = 1}) async {
    tester.view.physicalSize = Size(width, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(MaterialApp(
        theme: dark ? AppTheme.dark : AppTheme.light,
        builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaler: TextScaler.linear(scale)),
            child: child!),
        home: const CityRideScreen()));
    await tester.pumpAndSettle();
  }

  Future<void> tap(WidgetTester tester, String label) async {
    await tester.pump();
    if (find.text(label).evaluate().isEmpty) {
      await tester.scrollUntilVisible(find.text(label), 180,
          scrollable: find.byType(Scrollable).first);
    }
    final target = find.text(label).last;
    await tester.ensureVisible(target);
    await tester.tap(target);
    await tester.pumpAndSettle();
  }

  Future<void> screenshot(WidgetTester tester, String name) async {
    if (!const bool.fromEnvironment('CAPTURE_UI')) return;
    final boundary = tester
        .firstRenderObject<RenderRepaintBoundary>(find.byType(RepaintBoundary));
    await tester.runAsync(() async {
      final image = await boundary.toImage(pixelRatio: 2);
      final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
      final directory = Directory('build/ui-preview')
        ..createSync(recursive: true);
      File('${directory.path}/$name.png')
          .writeAsBytesSync(bytes!.buffer.asUint8List());
      image.dispose();
    });
  }

  testWidgets('Home entry opens the isolated city ride route', (tester) async {
    await tester.pumpWidget(MaterialApp(
        theme: AppTheme.light,
        onGenerateRoute: AppRoutes.generateRoute,
        home: const Scaffold(
            body: SingleChildScrollView(
                child: Padding(
                    padding: EdgeInsets.all(24), child: CityRideEntry())))));
    await tester.tap(find.text('Book a city ride'));
    await tester.pumpAndSettle();
    expect(find.text('Your city. Your way.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Complete local ride flow, payment preference and cancellation',
      (tester) async {
    await open(tester);
    await tap(tester, 'Choose a car');
    expect(find.text('Your city. Your way.'), findsOneWidget);
    await screenshot(tester, 'city-locations');
    await tap(tester, 'Sabarmati Riverfront');
    await tap(tester, 'Choose a car');
    await screenshot(tester, 'city-cars');
    await tap(tester, 'City Sedan');
    await tap(tester, 'Review ride');
    expect(find.text('₹169'), findsWidgets);
    await tap(tester, 'Cash');
    await tap(tester, 'UPI');
    expect(find.text('City Sedan · UPI'), findsOneWidget);
    await screenshot(tester, 'city-review');
    await tap(tester, 'Try booking preview');
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();
    expect(find.text('Aarav Patel'), findsOneWidget);
    await screenshot(tester, 'city-driver');
    await tap(tester, 'End ride preview');
    await tap(tester, 'Keep exploring');
    expect(find.text('Aarav Patel'), findsOneWidget);
    await tap(tester, 'End ride preview');
    await tap(tester, 'End preview');
    expect(find.text('A car for your everyday.'), findsOneWidget);
    expect(find.text('City Sedan · UPI'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
      'Address editing rejects identical endpoints and supports custom input',
      (tester) async {
    await open(tester);
    await tap(tester, 'Where are you going?');
    await tester.enterText(find.byType(TextField), 'Navrangpura, Ahmedabad');
    await tap(tester, 'Use this destination');
    expect(find.text('Choose a different pickup and destination.'),
        findsOneWidget);
    await tap(tester, 'Where are you going?');
    await tester.enterText(find.byType(TextField), 'My local cafe');
    await tap(tester, 'Use this destination');
    expect(find.text('My local cafe'), findsOneWidget);
    await tap(tester, 'Choose a car');
    await tester.tap(find.byTooltip('Back'));
    await tester.pumpAndSettle();
    expect(find.text('My local cafe'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Compact dark layout supports larger text', (tester) async {
    await open(tester, dark: true, width: 320, scale: 1.3);
    await tap(tester, 'CG Square Mall');
    await tap(tester, 'Choose a car');
    await tap(tester, 'City XL');
    await tap(tester, 'Review ride');
    await screenshot(tester, 'city-dark-compact');
    expect(find.text('City XL · Cash'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Rider UI covers arrival, active trip, receipt and rating',
      (tester) async {
    await open(tester);
    await tap(tester, 'Ahmedabad One Mall');
    await tap(tester, 'Choose a car');
    await tap(tester, 'Review ride');
    await tap(tester, 'Try booking preview');
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();

    await tap(tester, 'Preview driver arrival');
    expect(find.text('Your driver has arrived.'), findsOneWidget);
    expect(find.text('DRIVER AT PICKUP'), findsOneWidget);

    await tap(tester, 'Start ride preview');
    expect(find.text('TRIP IN PROGRESS · 8 MIN LEFT'), findsOneWidget);

    await tap(tester, 'Complete ride preview');
    expect(find.text('Ride complete'), findsOneWidget);
    expect(find.text('How was your city ride?'), findsOneWidget);
    await tester.tap(find.byTooltip('5 stars'));
    await tester.pump();
    expect(find.byIcon(Icons.star_rounded), findsNWidgets(5));
    expect(tester.takeException(), isNull);
  });
}
