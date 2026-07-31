# Dashboard Enhancements and Theme Toggle

The goal is to make the dashboard's profile icon clickable for navigation and implement a global theme toggle (Light/Dark mode) that affects the entire application.

## User Review Required

- **Theme Choice**: The user requested a "white yellow theme" for the light mode. I will interpret this as a light background with the existing gold/yellow accents.
- **State Management**: Since the app doesn't have a complex state management system yet (mostly using `MockData` and local `setState`), I will implement the theme toggle using a simple `ValueNotifier` or a singleton `ThemeManager` to keep it lightweight but global.

## Proposed Changes

### Core Component

#### [theme.dart](file:///D:/golongdrive/lib/app/theme.dart)

- Add a `LightMode` configuration with a white/light-grey background and gold accents.
- Implement a `ThemeService` or `ThemeController` (using `ValueNotifier<ThemeMode>`) to manage the current theme state.

### Navigation Component

#### [router.dart](file:///D:/golongdrive/lib/app/router.dart)

- Ensure the profile route is correctly accessible.

### Dashboard Component

#### [dashboard_screen.dart](file:///D:/golongdrive/lib/features/dashboard/dashboard_screen.dart)

- Wrap the profile icon in an `InkWell` or `GestureDetector` to navigate to the profile screen.
- Add a theme toggle button (e.g., an icon in the header or a dedicated card).

### Application Root

#### [main.dart](file:///D:/golongdrive/lib/main.dart)

- Wrap the `MaterialApp.router` with a `ValueListenableBuilder` that listens to the `ThemeService` to rebuild the app when the theme changes.

## Verification Plan

### Manual Verification
- Tap the profile icon on the dashboard and verify navigation to the profile screen.
- Tap the theme toggle button and verify that all screens (Splash, Login, Dashboard, etc.) switch to the light "white yellow" theme correctly.
- Ensure text visibility remains high in both themes.
