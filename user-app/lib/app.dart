// lib/app.dart
import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_controller.dart';
import 'core/theme/theme_scope.dart';
import 'routes/app_routes.dart';

class GoLongDriveApp extends StatefulWidget {
  const GoLongDriveApp({super.key});

  @override
  State<GoLongDriveApp> createState() => _GoLongDriveAppState();
}

class _GoLongDriveAppState extends State<GoLongDriveApp> {
  final ThemeController _themeController = ThemeController();

  @override
  void dispose() {
    _themeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _themeController,
      builder: (context, _) {
        return MaterialApp(
          title: 'GoLongDrive',
          debugShowCheckedModeBanner: false,
          theme: _themeController.isDark ? AppTheme.dark : AppTheme.light,
          initialRoute: AppRoutes.splash,
          onGenerateRoute: AppRoutes.generateRoute,
          // ThemeScope goes here (inside MaterialApp, wrapping the
          // Navigator) rather than above MaterialApp, so screens deep in
          // the route stack can find it via context and rebuild on toggle
          // via InheritedWidget dependency tracking — not by relying on
          // MaterialApp itself rebuilding the whole tree.
          builder: (context, child) => ThemeScope(
            controller: _themeController,
            child: child!,
          ),
        );
      },
    );
  }
}