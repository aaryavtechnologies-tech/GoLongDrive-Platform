import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:project/widgets/app_checkbox.dart';

void main() {
  testWidgets('AppCheckbox renders cleanly inside unbounded Row without exceptions',
      (WidgetTester tester) async {
    bool checked = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AppCheckbox(
                value: checked,
                onChanged: (v) => checked = v,
                label: const Text('Save login'),
                isExpanded: false,
              ),
              const Text('Forgot password?'),
            ],
          ),
        ),
      ),
    );

    expect(tester.takeException(), isNull);
    expect(find.text('Save login'), findsOneWidget);
    expect(find.text('Forgot password?'), findsOneWidget);
  });

  testWidgets('AppCheckbox renders cleanly with isExpanded=true inside Column',
      (WidgetTester tester) async {
    bool checked = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              AppCheckbox(
                value: checked,
                onChanged: (v) => checked = v,
                label: const Text('I agree to the Terms & Conditions'),
                isExpanded: true,
              ),
            ],
          ),
        ),
      ),
    );

    expect(tester.takeException(), isNull);
    expect(find.text('I agree to the Terms & Conditions'), findsOneWidget);
  });
}
