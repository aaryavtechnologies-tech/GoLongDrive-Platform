// lib/screens/main_tabs_screen.dart
import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';
import 'home/home_screen.dart';
import 'rides/my_rides_screen.dart';
import 'profile/profile_screen.dart';

class MainTabsScreen extends StatefulWidget {
  const MainTabsScreen({super.key});

  @override
  State<MainTabsScreen> createState() => _MainTabsScreenState();
}

class _MainTabsScreenState extends State<MainTabsScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    MyRidesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      backgroundColor: colors.background,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom),
        decoration: BoxDecoration(
          color: colors.surfaceCard,
          border: Border(top: BorderSide(color: colors.divider)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home_filled, Icons.home_outlined, 'Home', colors),
              _buildNavItem(1, Icons.confirmation_number, Icons.confirmation_number_outlined, 'Bookings', colors),
              _buildNavItem(2, Icons.person, Icons.person_outline, 'Profile', colors),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData activeIcon, IconData inactiveIcon, String label, AppColorPalette colors) {
    final bool isActive = _currentIndex == index;
    final Color color = isActive ? AppColors.primaryGold : colors.textSecondary;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = index;
        });
      },
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isActive ? activeIcon : inactiveIcon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTextStyles.caption.copyWith(
                color: color,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                fontSize: 10,
              ),
            ),
            const SizedBox(height: 4),
            // Yellow Indicator Dot
            Container(
              width: 4,
              height: 4,
              decoration: BoxDecoration(
                color: isActive ? AppColors.primaryGold : Colors.transparent,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
