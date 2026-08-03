// lib/core/theme/theme_scope.dart
import 'package:flutter/widgets.dart';
import 'theme_controller.dart';

/// Makes the app's [ThemeController] reachable via `ThemeScope.of(context)`.
///
/// Placed inside `MaterialApp.builder` in app.dart (wrapping the Navigator),
/// not above MaterialApp — that way `context.dependOnInheritedWidgetOfExactType`
/// correctly marks any screen that reads it as a dependent, so that screen
/// rebuilds the moment the theme toggles, regardless of where it sits in the
/// navigation stack.
class ThemeScope extends InheritedNotifier<ThemeController> {
  const ThemeScope({
    super.key,
    required ThemeController controller,
    required super.child,
  }) : super(notifier: controller);

  static ThemeController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<ThemeScope>();
    assert(scope != null, 'ThemeScope.of() called with no ThemeScope ancestor');
    return scope!.notifier!;
  }
}
