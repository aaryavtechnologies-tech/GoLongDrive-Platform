import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golongdrive/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('driver app renders its splash screen', (tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const GoLongDriveApp());
    await tester.pump(const Duration(milliseconds: 2500));

    expect(find.byType(MaterialApp), findsOneWidget);
    expect(find.text('GO LONG DRIVE'), findsOneWidget);

    // Let the splash decision finish, then dispose the router tree so no
    // navigation work leaks into another test.
    await tester.pump(const Duration(milliseconds: 600));
    await tester.pumpAndSettle();
    await tester.pumpWidget(const SizedBox.shrink());
  });
}
