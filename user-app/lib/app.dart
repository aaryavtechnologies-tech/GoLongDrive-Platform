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
    return AnimatedBuilder(
      animation: _themeController,
      builder: (context, _) {
        return MaterialApp(
          title: 'GoLongDrive',
          debugShowCheckedModeBanner: false,
          theme: _themeController.isDark ? AppTheme.dark : AppTheme.light,
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
      },
    );
  }
}