import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import 'home/home_screen.dart';
import 'rides/my_rides_screen.dart';
import 'packages/packages_screen.dart';
import 'profile/profile_screen.dart';

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
        duration: const Duration(milliseconds: 220),
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
      body: Stack(
        children: _screens.asMap().entries.map((entry) {
          final i = entry.key;
          final screen = entry.value;
          return AnimatedBuilder(
            animation: _fadeControllers[i],
            builder: (context, child) {
              final opacity = _fadeControllers[i].value;
              final yOffset = (1.0 - _fadeControllers[i].value) * 18.0;
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
      bottomNavigationBar: _AnimatedNavBar(
        currentIndex: _currentIndex,
        onTap: _onTabChanged,
        colors: colors,
      ),
    );
  }
}

class _AnimatedNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final AppColorPalette colors;

  const _AnimatedNavBar({
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
      icon: Icons.confirmation_number_outlined,
      activeIcon: Icons.confirmation_number_rounded,
    ),
    _NavItem(
      label: 'Packages',
      icon: Icons.inventory_2_outlined,
      activeIcon: Icons.inventory_2_rounded,
    ),
    _NavItem(
      label: 'Profile',
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: colors.divider, width: 0.8)),
        color: colors.surface,
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: _items.asMap().entries.map((entry) {
              final i = entry.key;
              final item = entry.value;
              final isSelected = currentIndex == i;
              return _NavButton(
                item: item,
                isSelected: isSelected,
                colors: colors,
                onTap: () => onTap(i),
              );
            }).toList(),
          ),
        ),
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

class _NavButton extends StatefulWidget {
  final _NavItem item;
  final bool isSelected;
  final AppColorPalette colors;
  final VoidCallback onTap;

  const _NavButton({
    required this.item,
    required this.isSelected,
    required this.colors,
    required this.onTap,
  });

  @override
  State<_NavButton> createState() => _NavButtonState();
}

class _NavButtonState extends State<_NavButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 200),
    value: widget.isSelected ? 1.0 : 0.0,
  );

  late final Animation<double> _scaleAnim = Tween<double>(begin: 1.0, end: 1.1)
      .animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));

  @override
  void didUpdateWidget(_NavButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSelected != oldWidget.isSelected) {
      if (widget.isSelected) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isSelected = widget.isSelected;
    final colors = widget.colors;
    final item = widget.item;

    return GestureDetector(
      onTap: widget.onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnim.value,
            child: child,
          );
        },
        child: SizedBox(
          width: 72,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeInOut,
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primaryGold.withValues(alpha: 0.14)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 180),
                  transitionBuilder: (child, animation) => ScaleTransition(
                    scale: animation,
                    child: FadeTransition(opacity: animation, child: child),
                  ),
                  child: Icon(
                    isSelected ? item.activeIcon : item.icon,
                    key: ValueKey(isSelected),
                    size: 22,
                    color: isSelected
                        ? AppColors.primaryGold
                        : colors.textSecondary,
                  ),
                ),
              ),
              const SizedBox(height: 3),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 180),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color:
                      isSelected ? AppColors.primaryGold : colors.textSecondary,
                  letterSpacing: 0.1,
                ),
                child: Text(item.label),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
