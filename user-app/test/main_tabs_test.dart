import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:project/screens/main_tabs_screen.dart';
import 'package:project/core/services/user_scope.dart';
import 'package:project/core/services/user_controller.dart';

void main() {
  testWidgets('MainTabsScreen renders 2026 floating island nav bar and changes tabs',
      (WidgetTester tester) async {
    final userController = UserController();

    await tester.pumpWidget(
      UserScope(
        controller: userController,
        child: const MaterialApp(
          home: MainTabsScreen(),
        ),
      ),
    );

    await tester.pump();

    // Verify nav items
    expect(find.text('Home'), findsOneWidget);
    expect(find.byIcon(Icons.home_rounded), findsOneWidget);
    expect(find.byIcon(Icons.receipt_long_outlined), findsOneWidget);
    expect(find.byIcon(Icons.explore_outlined), findsOneWidget);
    expect(find.byIcon(Icons.person_outline_rounded), findsOneWidget);

    // Tap Bookings tab
    await tester.tap(find.byIcon(Icons.receipt_long_outlined));
    await tester.pump(const Duration(milliseconds: 300));

    // Now Bookings should be active
    expect(find.text('Bookings'), findsOneWidget);
    expect(find.byIcon(Icons.receipt_long_rounded), findsWidgets);

    // Tap Profile tab
    await tester.tap(find.byIcon(Icons.person_outline_rounded));
    await tester.pump(const Duration(milliseconds: 300));

    // Now Profile should be active
    expect(find.text('Profile'), findsWidgets);
    expect(find.byIcon(Icons.person_rounded), findsOneWidget);
  });
}
