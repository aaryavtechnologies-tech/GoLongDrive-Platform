// lib/screens/packages/packages_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class PackagesScreen extends StatelessWidget {
  const PackagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ride Packages',
                      style: AppTextStyles.mediumHeading
                          .copyWith(color: colors.textPrimary),
                    ).animate().fadeIn(duration: 300.ms),
                    const SizedBox(height: 4),
                    Text(
                      'Save more on every outstation journey',
                      style: AppTextStyles.bodySecondary
                          .copyWith(color: colors.textSecondary),
                    ).animate().fadeIn(delay: 100.ms, duration: 300.ms),
                    const SizedBox(height: 28),

                    // Hero card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primaryGold,
                            AppColors.primaryGoldDark,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.card_membership_rounded,
                                  color: Colors.white, size: 36),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Text(
                                  'GoLong Memberships',
                                  style: AppTextStyles.mediumHeading
                                      .copyWith(color: Colors.white),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Pre-pay for rides and save up to 25% on every trip. Lock in lower rates before they go up.',
                            style: AppTextStyles.body.copyWith(
                                color: Colors.white.withValues(alpha: 0.88)),
                          ),
                          const SizedBox(height: 20),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 18, vertical: 10),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.35)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.local_offer_rounded,
                                    color: Colors.white, size: 16),
                                const SizedBox(width: 8),
                                Text(
                                  'Active plans start from ₹999/month',
                                  style: AppTextStyles.caption.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 150.ms, duration: 400.ms).slideY(begin: 0.08, end: 0),

                    const SizedBox(height: 32),

                    Text(
                      'Choose your plan',
                      style: AppTextStyles.subtitle
                          .copyWith(color: colors.textPrimary),
                    ).animate().fadeIn(delay: 200.ms, duration: 300.ms),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),

            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  ..._packages.asMap().entries.map(
                    (entry) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _PackageCard(
                        pkg: entry.value,
                        delay: Duration(milliseconds: 240 + entry.key * 90),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _PerksSection(),
                  const SizedBox(height: 40),
                ]),
              ),
            ),
          ],
        ),
      ),
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
    _PackageData(
      name: 'Family Explorer',
      tagline: 'For group road trips that matter',
      price: '₹1,799',
      period: '/month',
      km: '1000 km',
      trips: '10 trips',
      validity: '30 days',
      badge: '6-seater included',
      badgeColor: Color(0xFF3B916E),
      features: ['6-seater vehicles', 'Extra luggage space', '2 free date changes/trip'],
      icon: Icons.family_restroom_rounded,
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

class _PackageCard extends StatelessWidget {
  final _PackageData pkg;
  final Duration delay;

  const _PackageCard({required this.pkg, required this.delay});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.divider.withValues(alpha: 0.6)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: colors.surfaceElevated,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGold.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(pkg.icon, color: AppColors.primaryGold, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(pkg.name,
                          style: AppTextStyles.subtitle
                              .copyWith(color: colors.textPrimary, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(pkg.tagline,
                          style: AppTextStyles.caption
                              .copyWith(color: colors.textSecondary)),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: pkg.badgeColor.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    pkg.badge,
                    style: AppTextStyles.caption.copyWith(
                      color: pkg.badgeColor,
                      fontWeight: FontWeight.w700,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Stats row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Row(
              children: [
                _StatChip(icon: Icons.map_outlined, value: pkg.km, label: 'Included'),
                const SizedBox(width: 12),
                _StatChip(icon: Icons.route_rounded, value: pkg.trips, label: 'Trips'),
                const SizedBox(width: 12),
                _StatChip(icon: Icons.timer_outlined, value: pkg.validity, label: 'Valid for'),
              ],
            ),
          ),

          Divider(height: 1, color: colors.divider.withValues(alpha: 0.5)),

          // Features
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ...pkg.features.map(
                  (f) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_rounded,
                            color: AppColors.primaryGold, size: 16),
                        const SizedBox(width: 10),
                        Text(f,
                            style: AppTextStyles.caption
                                .copyWith(color: colors.textPrimary)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: pkg.price,
                            style: AppTextStyles.priceLarge.copyWith(fontSize: 22),
                          ),
                          TextSpan(
                            text: pkg.period,
                            style: AppTextStyles.caption.copyWith(
                                color: colors.textSecondary, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    _SelectButton(),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: delay, duration: 400.ms).slideY(begin: 0.06, end: 0);
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _StatChip({required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: colors.background,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: colors.divider.withValues(alpha: 0.5)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 16, color: AppColors.primaryGold),
            const SizedBox(height: 6),
            Text(value,
                style: AppTextStyles.body.copyWith(
                    color: colors.textPrimary, fontWeight: FontWeight.w700, fontSize: 13)),
            Text(label,
                style: AppTextStyles.caption.copyWith(color: colors.textSecondary, fontSize: 10)),
          ],
        ),
      ),
    );
  }
}

class _SelectButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Plans launching soon — stay tuned!')),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.primaryGold, AppColors.primaryGoldDark],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          'Get Plan',
          style: AppTextStyles.body.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _PerksSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.divider.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Why GoLong Packages?',
              style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
          const SizedBox(height: 16),
          ..._perks.map(
            (p) => Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGold.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(p.$1, color: AppColors.primaryGold, size: 20),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.$2,
                            style: AppTextStyles.body.copyWith(
                                color: colors.textPrimary, fontWeight: FontWeight.w600)),
                        Text(p.$3,
                            style: AppTextStyles.caption
                                .copyWith(color: colors.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 600.ms, duration: 350.ms);
  }

  static const List<(IconData, String, String)> _perks = [
    (Icons.savings_rounded, 'Save up to 25%', 'Pre-pay and lock in lower rates on every trip'),
    (Icons.flash_on_rounded, 'Priority booking', 'Package holders get faster driver assignments'),
    (Icons.support_agent_rounded, 'Dedicated support', '24/7 priority support for all package riders'),
    (Icons.refresh_rounded, 'Rollover unused km', 'Unused kilometres carry forward to next month'),
  ];
}
