// lib/app.dart
import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_controller.dart';
import 'core/theme/theme_scope.dart';
import 'routes/app_routes.dart';
import 'core/services/user_controller.dart';
import 'core/services/user_scope.dart';

class GoLongDriveApp extends StatefulWidget {
  const GoLongDriveApp({super.key});

  @override
  State<GoLongDriveApp> createState() => _GoLongDriveAppState();
}

class _GoLongDriveAppState extends State<GoLongDriveApp> {
  final ThemeController _themeController = ThemeController();
  final UserController _userController = UserController();

  @override
  void dispose() {
    _themeController.dispose();
    _userController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GoLongDrive',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.light, // Dark mode removed: always display white-and-yellow theme
      themeMode: ThemeMode.light, // Disables automatic system-theme switching
      initialRoute: AppRoutes.splash,
      onGenerateRoute: AppRoutes.generateRoute,
      builder: (context, child) => ThemeScope(
        controller: _themeController,
        child: UserScope(
          controller: _userController,
          child: child!,
        ),
      ),
    );
  }
}
