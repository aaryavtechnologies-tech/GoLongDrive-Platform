import 'package:flutter/material.dart';
import 'app/theme.dart';
import 'app/router.dart';

void main() {
  runApp(const GoLongDriveApp());
}

class GoLongDriveApp extends StatelessWidget {
  const GoLongDriveApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: ThemeService.instance.themeMode,
      builder: (context, themeMode, child) {
        return MaterialApp.router(
          title: 'GoLongDrive',
          debugShowCheckedModeBanner: false,
          theme: buildLightTheme(),
          darkTheme: buildDarkTheme(),
          themeMode: themeMode,
          routerConfig: appRouter,
        );
      },
    );
  }
}
