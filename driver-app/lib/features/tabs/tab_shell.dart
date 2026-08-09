import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
import '../../app/theme.dart';
import '../dashboard/dashboard_screen.dart';
import '../rides/rides_screen.dart';
import '../earnings/earnings_screen.dart';
import '../profile/profile_screen.dart';
import '../../core/data/socket_service.dart';

/// Bottom tab shell matching app/(tabs)/_layout.tsx.
/// Navigation rule: this is the ONLY screen reachable after login/register
/// success. Back button on Android should NOT pop past this into auth
/// screens — handled by using context.go('/tabs') (go_router, Phase 6)
/// when entering, which replaces the whole stack.
class TabShell extends StatefulWidget {
  const TabShell({super.key, this.initialTab = 0});

  /// Which tab to show first (0=Home, 1=My Rides, 2=Earnings, 3=Profile).
  /// Set by the router from the `?tab=` query param, e.g. when the
  /// dashboard's profile icon does `context.push('/tabs?tab=3')`.
  final int initialTab;

  @override
  State<TabShell> createState() => _TabShellState();
}

class _TabShellState extends State<TabShell> {
  late int _tabIndex = widget.initialTab;
  StreamSubscription? _rideReqSub;

  @override
  void initState() {
    super.initState();
    _initSocket();
  }

  Future<void> _initSocket() async {
    await SocketService.init();
    
    _rideReqSub = SocketService.onRideRequest.listen((bookingData) {
      if (!mounted) return;
      context.push('/rides/incoming', extra: {'booking': bookingData});
    });
  }

  @override
  void dispose() {
    _rideReqSub?.cancel();
    // Do NOT disconnect socket here because TabShell is the root of the app.
    super.dispose();
  }

  static const _tabs = [
    (icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Home'),
    (icon: Icons.directions_car_outlined, activeIcon: Icons.directions_car, label: 'My Rides'),
    (icon: Icons.account_balance_wallet_outlined, activeIcon: Icons.account_balance_wallet, label: 'Earnings'),
    (icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
  ];

  Widget _screenFor(int index) {
    // NOTE: these are intentionally NOT `const`. A `const DashboardScreen()`
    // (etc.) gets canonicalized by Dart, so Flutter's element diffing sees
    // the exact same widget instance on every rebuild and skips calling
    // build() on it again — which meant these tabs silently kept rendering
    // with whatever theme was active when they first mounted, never
    // picking up a later theme toggle. Removing `const` here lets the
    // ValueListenableBuilder below force all four tabs to actually
    // rebuild with fresh colors when the theme changes.
    switch (index) {
      case 0:
        return DashboardScreen();
      case 1:
        return RidesScreen();
      case 2:
        return EarningsScreen();
      case 3:
        return ProfileScreen();
      default:
        return const SizedBox();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Rebuilding on ThemeService's notifier directly (rather than relying on
    // the theme change cascading down from MaterialApp through the router)
    // guarantees this whole shell — background, bottom bar, and every tab —
    // repaints the moment Light/Dark is toggled, no matter where in the
    // widget tree the toggle happened.
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: ThemeService.instance.themeMode,
      builder: (context, _, __) {
        return Scaffold(
          backgroundColor: AppColors.background,
          body: IndexedStack(
            index: _tabIndex,
            children: List.generate(_tabs.length, (i) => _screenFor(i)),
          ),
          bottomNavigationBar: DecoratedBox(
            decoration: BoxDecoration(
              color: AppColors.surfaceAlt,
              border: Border(top: BorderSide(color: AppColors.borderSubtle)),
            ),
            child: SafeArea(
              top: false,
              child: SizedBox(
                height: 64,
                child: Row(
                  children: List.generate(_tabs.length, (i) {
                    final tab = _tabs[i];
                    final active = i == _tabIndex;
                    return Expanded(
                      child: InkWell(
                        onTap: () => setState(() => _tabIndex = i),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              active ? tab.activeIcon : tab.icon,
                              color: active ? AppColors.gold : AppColors.textMuted,
                              size: 24,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              tab.label,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: active ? AppColors.gold : AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

