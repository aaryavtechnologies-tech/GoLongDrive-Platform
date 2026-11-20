import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:project/screens/auth/login_screen.dart';
import 'package:project/screens/home/home_screen.dart';
import 'package:project/core/services/user_scope.dart';
import 'package:project/core/services/user_controller.dart';

void main() {
  testWidgets('LoginScreen renders modern UI elements cleanly without exceptions',
      (WidgetTester tester) async {
    final userController = UserController();

    await tester.pumpWidget(
      UserScope(
        controller: userController,
        child: const MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    await tester.pump();

    // Verify brand badge & text
    expect(find.text('GO LONG DRIVE'), findsOneWidget);
    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Save login'), findsOneWidget);
    expect(find.text('Forgot password?'), findsOneWidget);
    expect(find.text('Log In'), findsOneWidget);
    expect(find.text('Sign Up'), findsOneWidget);
    expect(find.text('256-Bit SSL Encrypted & Verified Rides'), findsOneWidget);

    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump(const Duration(seconds: 1));
  });

  testWidgets('HomeScreen renders modern search card, categories and header cleanly',
      (WidgetTester tester) async {
    final userController = UserController();

    await tester.pumpWidget(
      UserScope(
        controller: userController,
        child: const MaterialApp(
          home: HomeScreen(),
        ),
      ),
    );

    await tester.pump();

    // Verify header, quick categories & search card elements
    expect(find.text('Where to next?'), findsOneWidget);
    expect(find.text('Outstation'), findsOneWidget);
    expect(find.text('Tours'), findsOneWidget);
    expect(find.text('My Rides'), findsOneWidget);
    expect(find.text('Plan Your Journey'), findsOneWidget);
    expect(find.text('PICKUP LOCATION'), findsOneWidget);
    expect(find.text('DROP DESTINATION'), findsOneWidget);
    expect(find.text('Search Outstation Cabs'), findsOneWidget);

    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump(const Duration(seconds: 1));
  });
}
