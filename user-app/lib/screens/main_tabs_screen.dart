// lib/screens/main_tabs_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_colors.dart';
import 'home/home_screen.dart';
import 'rides/my_rides_screen.dart';
import 'packages/packages_screen.dart';
import 'profile/profile_screen.dart';

/// 2026 Modern Main Tabs Screen featuring a Floating Island Capsule navigation dock.
/// Pure White & Yellow brand identity with expanding morphing pill indicators.
class MainTabsScreen extends StatefulWidget {
  const MainTabsScreen({super.key});

  @override
  State<MainTabsScreen> createState() => _MainTabsScreenState();
}

class _MainTabsScreenState extends State<MainTabsScreen>
    with TickerProviderStateMixin {
  int _currentIndex = 0;

  late final List<AnimationController> _fadeControllers;

  final List<Widget> _screens = const [
    HomeScreen(),
    MyRidesScreen(),
    PackagesScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _fadeControllers = List.generate(
      _screens.length,
      (i) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 240),
        value: i == 0 ? 1.0 : 0.0,
      ),
    );
  }

  @override
  void dispose() {
    for (final c in _fadeControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _onTabChanged(int index) {
    if (index == _currentIndex) return;
    HapticFeedback.lightImpact();
    _fadeControllers[_currentIndex].reverse();
    setState(() {
      _currentIndex = index;
    });
    _fadeControllers[index].forward(from: 0.0);
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      extendBody: true, // Allows smooth content and map underflow beneath floating dock
      body: Stack(
        children: _screens.asMap().entries.map((entry) {
          final i = entry.key;
          final screen = entry.value;
          return AnimatedBuilder(
            animation: _fadeControllers[i],
            builder: (context, child) {
              final opacity = _fadeControllers[i].value;
              final yOffset = (1.0 - _fadeControllers[i].value) * 16.0;
              return Opacity(
                opacity: opacity.clamp(0.0, 1.0),
                child: Transform.translate(
                  offset: Offset(0, yOffset),
                  child: IgnorePointer(
                    ignoring: i != _currentIndex,
                    child: child,
                  ),
                ),
              );
            },
            child: screen,
          );
        }).toList(),
      ),
      bottomNavigationBar: _Modern2026FloatingNavBar(
        currentIndex: _currentIndex,
        onTap: _onTabChanged,
        colors: colors,
      ),
    );
  }
}

class _NavItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;

  const _NavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
  });
}

/// 2026 Floating Island Capsule Navigation Dock.
/// Features dual-layer elevation shadows, pill-morphing active states,
/// and smooth haptic tactile feedback.
class _Modern2026FloatingNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final AppColorPalette colors;

  const _Modern2026FloatingNavBar({
    required this.currentIndex,
    required this.onTap,
    required this.colors,
  });

  static const _items = [
    _NavItem(
      label: 'Home',
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
    ),
    _NavItem(
      label: 'Bookings',
      icon: Icons.receipt_long_outlined,
      activeIcon: Icons.receipt_long_rounded,
    ),
    _NavItem(
      label: 'Packages',
      icon: Icons.explore_outlined,
      activeIcon: Icons.explore_rounded,
    ),
    _NavItem(
      label: 'Profile',
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      bottom: true,
      minimum: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 18),
        child: Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(32),
            border: Border.all(
              color: const Color(0xFFEEEEEE),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 28,
                spreadRadius: 0,
                offset: const Offset(0, 10),
              ),
              BoxShadow(
                color: AppColors.primaryYellow.withValues(alpha: 0.16),
                blurRadius: 16,
                spreadRadius: -2,
                offset: const Offset(0, 4),
              ),
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: _items.asMap().entries.map((entry) {
              final i = entry.key;
              final item = entry.value;
              final isSelected = currentIndex == i;
              return _ModernTabButton(
                item: item,
                isSelected: isSelected,
                onTap: () => onTap(i),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _ModernTabButton extends StatelessWidget {
  final _NavItem item;
  final bool isSelected;
  final VoidCallback onTap;

  const _ModernTabButton({
    required this.item,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.fastOutSlowIn,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 16 : 14,
          vertical: 9,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryYellow : Colors.transparent,
          borderRadius: BorderRadius.circular(22),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primaryYellow.withValues(alpha: 0.40),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              transitionBuilder: (child, anim) => ScaleTransition(
                scale: anim,
                child: child,
              ),
              child: Icon(
                isSelected ? item.activeIcon : item.icon,
                key: ValueKey(isSelected),
                size: 21,
                color: isSelected ? AppColors.textPrimary : const Color(0xFF757575),
              ),
            ),
            ClipRect(
              child: AnimatedSize(
                duration: const Duration(milliseconds: 220),
                curve: Curves.fastOutSlowIn,
                child: isSelected
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(width: 7),
                          Text(
                            item.label,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.2,
                            ),
                            maxLines: 1,
                          ),
                        ],
                      )
                    : const SizedBox.shrink(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
