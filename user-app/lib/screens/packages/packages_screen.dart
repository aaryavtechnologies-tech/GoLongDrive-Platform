// lib/screens/packages/packages_screen.dart
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/services/tour_package_service.dart';
import '../../models/tour_package.dart';
import '../tour_packages/tour_package_detail_screen.dart';

class PackagesScreen extends StatefulWidget {
  const PackagesScreen({super.key});

  @override
  State<PackagesScreen> createState() => _PackagesScreenState();
}

class _PackagesScreenState extends State<PackagesScreen> {
  int _selectedTabIndex = 0; // 0 = Tour Packages, 1 = Memberships
  final TourPackageService _tourService = TourPackageService();
  List<TourPackage> _tourPackages = [];
  bool _loadingTours = true;

  @override
  void initState() {
    super.initState();
    _fetchTours();
  }

  Future<void> _fetchTours() async {
    try {
      final list = await _tourService.getTourPackages();
      if (mounted) {
        setState(() {
          _tourPackages = list;
          _loadingTours = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _loadingTours = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Header & Tab Toggle
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Packages & Tours',
                    style: AppTextStyles.mediumHeading.copyWith(
                      color: colors.textPrimary,
                      fontSize: 22,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Explore curated tour packages or save with memberships',
                    style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                  ),
                  const SizedBox(height: 16),

                  // Pill Tabs
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: colors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: colors.divider.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedTabIndex = 0),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _selectedTabIndex == 0 ? AppColors.primaryGold : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Center(
                                child: Text(
                                  'Tour Packages',
                                  style: TextStyle(
                                    color: _selectedTabIndex == 0 ? Colors.white : colors.textSecondary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedTabIndex = 1),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _selectedTabIndex == 1 ? AppColors.primaryGold : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Center(
                                child: Text(
                                  'Ride Memberships',
                                  style: TextStyle(
                                    color: _selectedTabIndex == 1 ? Colors.white : colors.textSecondary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Tab Content
            Expanded(
              child: _selectedTabIndex == 0
                  ? _buildTourPackagesTab(colors)
                  : _buildMembershipsTab(colors),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTourPackagesTab(AppColorPalette colors) {
    if (_loadingTours) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primaryGold));
    }

    if (_tourPackages.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.landscape_rounded, size: 64, color: colors.textSecondary.withValues(alpha: 0.4)),
              const SizedBox(height: 16),
              Text(
                'No tour packages available',
                style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary),
              ),
              const SizedBox(height: 8),
              Text(
                'New multi-day curated tour packages will be listed here shortly.',
                style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchTours,
      color: AppColors.primaryGold,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        itemCount: _tourPackages.length,
        itemBuilder: (context, index) {
          final pkg = _tourPackages[index];
          final img = pkg.fullImageUrl;

          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => TourPackageDetailScreen(package: pkg),
                ),
              );
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 18),
              decoration: BoxDecoration(
                color: colors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: colors.divider.withValues(alpha: 0.3)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                        child: img != null && img.isNotEmpty
                            ? Image.network(
                                img,
                                height: 165,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (ctx, err, st) => Container(
                                  height: 165,
                                  color: colors.surfaceElevated,
                                  child: const Center(
                                    child: Icon(Icons.landscape_rounded, size: 50, color: Colors.grey),
                                  ),
                                ),
                              )
                            : Container(
                                height: 165,
                                color: colors.surfaceElevated,
                                child: Center(
                                  child: Icon(
                                    Icons.landscape_rounded,
                                    size: 50,
                                    color: AppColors.primaryGold.withValues(alpha: 0.5),
                                  ),
                                ),
                              ),
                      ),
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.75),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.4)),
                          ),
                          child: Text(
                            '${pkg.days}D / ${pkg.nights}N',
                            style: const TextStyle(
                              color: AppColors.primaryGold,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pkg.title,
                          style: AppTextStyles.subtitle.copyWith(
                            color: colors.textPrimary,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        if (pkg.route != null && pkg.route!.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              const Icon(Icons.route_rounded, size: 14, color: AppColors.primaryGold),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  pkg.route!,
                                  style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 12),
                        const Divider(height: 1),
                        const SizedBox(height: 10),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '₹${pkg.price.toInt()}',
                                  style: AppTextStyles.priceLarge.copyWith(
                                    color: colors.textPrimary,
                                    fontSize: 19,
                                  ),
                                ),
                                if (pkg.pricePerPerson > 0)
                                  Text(
                                    '₹${pkg.pricePerPerson.toInt()}/person',
                                    style: AppTextStyles.caption.copyWith(
                                      color: AppColors.primaryGold,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                              decoration: BoxDecoration(
                                color: AppColors.primaryGold,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Text(
                                'Book Now',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildMembershipsTab(AppColorPalette colors) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.primaryGold,
                        AppColors.primaryGoldDark,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.card_membership_rounded, color: Colors.white, size: 32),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'GoLong Memberships',
                              style: AppTextStyles.mediumHeading.copyWith(color: Colors.white, fontSize: 18),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Pre-pay for rides and save up to 25% on every trip.',
                        style: AppTextStyles.caption.copyWith(color: Colors.white.withValues(alpha: 0.9)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              ..._packages.map(
                (pkg) => Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: _MembershipCard(pkg: pkg),
                ),
              ),
              const SizedBox(height: 20),
            ]),
          ),
        ),
      ],
    );
  }

  static const List<_PackageData> _packages = [
    _PackageData(
      name: 'Monthly Rider',
      tagline: 'Perfect for frequent travellers',
      price: '₹999',
      period: '/month',
      km: '500 km',
      trips: '8 trips',
      validity: '30 days',
      badge: 'Most Popular',
      badgeColor: Color(0xFF267568),
      features: ['Free cancellation up to 2 hr', 'Priority driver match', 'AC rides only'],
      icon: Icons.calendar_month_rounded,
    ),
    _PackageData(
      name: 'Weekend Warrior',
      tagline: 'For those spontaneous getaways',
      price: '₹499',
      period: '/month',
      km: '250 km',
      trips: '4 trips',
      validity: '30 days',
      badge: 'Best for Leisure',
      badgeColor: Color(0xFFAD752B),
      features: ['Valid Fri–Sun only', 'AC rides', 'Family-friendly vehicles'],
      icon: Icons.wb_sunny_rounded,
    ),
    _PackageData(
      name: 'Corporate Commuter',
      tagline: 'Built for business travel',
      price: '₹2,499',
      period: '/month',
      km: '1500 km',
      trips: '20 trips',
      validity: '30 days',
      badge: 'Best Value',
      badgeColor: Color(0xFF267568),
      features: ['GST invoice included', 'Premium sedans & SUVs', 'Meet & greet option'],
      icon: Icons.business_center_rounded,
    ),
  ];
}

class _PackageData {
  final String name, tagline, price, period, km, trips, validity, badge;
  final Color badgeColor;
  final List<String> features;
  final IconData icon;

  const _PackageData({
    required this.name,
    required this.tagline,
    required this.price,
    required this.period,
    required this.km,
    required this.trips,
    required this.validity,
    required this.badge,
    required this.badgeColor,
    required this.features,
    required this.icon,
  });
}

class _MembershipCard extends StatelessWidget {
  final _PackageData pkg;

  const _MembershipCard({required this.pkg});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.divider.withValues(alpha: 0.6)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(pkg.icon, color: AppColors.primaryGold, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    pkg.name,
                    style: AppTextStyles.subtitle.copyWith(
                      color: colors.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                Text(
                  pkg.price,
                  style: AppTextStyles.priceLarge.copyWith(fontSize: 18),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...pkg.features.map(
              (f) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: AppColors.primaryGold, size: 14),
                    const SizedBox(width: 8),
                    Text(f, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
