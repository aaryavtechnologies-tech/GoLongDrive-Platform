import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_loader.dart';
import 'payout_history_screen.dart';
import 'payout_request_screen.dart';

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  bool _loading = true;
  bool _refreshing = false;
  String _errorMsg = '';
  int _selectedTab = 0; // 0 = Today, 1 = Lifetime

  // Wallet data
  double _walletBalance = 0;
  double _pendingPayouts = 0;

  // Today stats
  double _todayEarnings = 0;
  double _todayDistance = 0;
  int _todayRides = 0;
  double _todayHours = 0;

  // Lifetime stats
  double _lifetimeTotal = 0;
  double _lifetimeNet = 0;
  double _lifetimeCommission = 0;
  int _lifetimeRides = 0;
  double _lifetimeDistance = 0;

  double _weekEarnings = 0;
  double _monthEarnings = 0;

  List<dynamic> _distanceGraph = [];
  List<dynamic> _transactions = [];

  @override
  void initState() {
    super.initState();
    ThemeService.instance.themeMode.addListener(_onThemeUpdated);
    _fetchData();
  }

  void _onThemeUpdated() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    ThemeService.instance.themeMode.removeListener(_onThemeUpdated);
    super.dispose();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() {
      if (!_refreshing) _loading = true;
      _errorMsg = '';
    });

    try {
      final res = await ApiService.get('/earnings/driver/dashboard');
      if (res.statusCode == 200) {
        final d = jsonDecode(res.body)['data'];

        final wallet = d['wallet'] ?? {};
        final today = d['today'] ?? {};
        final lifetime = d['lifetime'] ?? {};

        setState(() {
          _walletBalance = (wallet['balance'] ?? 0).toDouble();
          _pendingPayouts = (wallet['pendingPayouts'] ?? 0).toDouble();

          _todayEarnings = (today['earnings'] ?? 0).toDouble();
          _todayDistance = (today['distanceKm'] ?? 0).toDouble();
          _todayRides = (today['ridesCount'] ?? 0).toInt();
          _todayHours = (today['hoursOnline'] ?? 0).toDouble();

          _lifetimeTotal = (lifetime['totalEarnings'] ?? 0).toDouble();
          _lifetimeNet = (lifetime['netEarnings'] ?? 0).toDouble();
          _lifetimeCommission = (lifetime['commissionPaid'] ?? 0).toDouble();
          _lifetimeRides = (lifetime['ridesCount'] ?? 0).toInt();
          _lifetimeDistance = (lifetime['distanceKm'] ?? 0).toDouble();

          _weekEarnings = (d['thisWeek'] ?? 0).toDouble();
          _monthEarnings = (d['thisMonth'] ?? 0).toDouble();

          _distanceGraph = d['distanceGraph'] ?? [];
          _transactions = d['recentTransactions'] ?? [];
        });
      } else {
        throw Exception('Failed to load earnings dashboard');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMsg = 'Failed to load earnings. Pull down to retry.');
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
          _refreshing = false;
        });
      }
    }
  }

  Future<void> _onRefresh() async {
    _refreshing = true;
    await _fetchData();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && !_refreshing) {
      return SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
          children: [
            Text('Earnings & Wallet', style: AppText.cardHeadline),
            const SizedBox(height: 20),
            const SkeletonCard(height: 160),
            const SizedBox(height: 20),
            const Row(
              children: [
                Expanded(child: SkeletonCard(height: 90)),
                SizedBox(width: 12),
                Expanded(child: SkeletonCard(height: 90)),
              ],
            ),
            const SizedBox(height: 20),
            const SkeletonCard(height: 200),
          ],
        ),
      );
    }

    if (_errorMsg.isNotEmpty && !_refreshing) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: ErrorStateWidget(
          title: 'Unable to Load Earnings',
          message: _errorMsg,
          onRetry: _onRefresh,
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.gold,
          backgroundColor: AppColors.surface,
          onRefresh: _onRefresh,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            children: [
              // Top Title + Refresh
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Earnings & Wallet', style: AppText.cardHeadline),
                  IconButton(
                    icon: Icon(Icons.refresh, color: AppColors.textSecondary),
                    onPressed: _onRefresh,
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Wallet Balance Card
              _buildWalletBalanceCard(),
              const SizedBox(height: 20),

              // Segmented Tab Selector (Today vs Lifetime)
              _buildTabSelector(),
              const SizedBox(height: 20),

              // Dynamic Tab Body
              if (_selectedTab == 0) ...[
                _buildTodayView(),
              ] else ...[
                _buildLifetimeView(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // --- Wallet Balance Card ---
  Widget _buildWalletBalanceCard() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: AppGradients.goldBalanceCard,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.35),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Withdrawable Wallet Balance',
                  style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
              if (_pendingPayouts > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text('₹${_pendingPayouts.toStringAsFixed(0)} pending',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '₹${_walletBalance.toStringAsFixed(2)}',
            style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900, letterSpacing: -0.5),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => PayoutRequestScreen(availableBalance: _walletBalance),
                      ),
                    ).then((_) => _onRefresh());
                  },
                  icon: const Icon(Icons.arrow_upward, color: Colors.black, size: 16),
                  label: const Text('Request Payout',
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const PayoutHistoryScreen()),
                    );
                  },
                  icon: const Icon(Icons.history, color: Colors.white, size: 16),
                  label: const Text('Payout History',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.white70, width: 1.5),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- Segmented Tab Selector ---
  Widget _buildTabSelector() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle2),
      ),
      child: Row(
        children: [
          Expanded(
            child: _tabButton('Today\'s Earnings', 0, Icons.today),
          ),
          Expanded(
            child: _tabButton('Lifetime Earnings', 1, Icons.all_inclusive),
          ),
        ],
      ),
    );
  }

  Widget _tabButton(String title, int index, IconData icon) {
    final active = _selectedTab == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: active ? AppColors.gold : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: active ? Colors.black : AppColors.textSecondary),
            const SizedBox(width: 6),
            Text(
              title,
              style: TextStyle(
                color: active ? Colors.black : AppColors.textSecondary,
                fontWeight: active ? FontWeight.bold : FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- Today's View ---
  Widget _buildTodayView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 4 Stat Cards
        Row(
          children: [
            Expanded(child: _metricCard('Today\'s Net', '₹${_todayEarnings.toStringAsFixed(0)}', Icons.payments, AppColors.gold)),
            const SizedBox(width: 12),
            Expanded(child: _metricCard('Distance Covered', '${_todayDistance.toStringAsFixed(1)} km', Icons.route, Colors.blue)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _metricCard('Rides Completed', '$_todayRides trips', Icons.directions_car, AppColors.success)),
            const SizedBox(width: 12),
            Expanded(child: _metricCard('Time Online', '${_todayHours.toStringAsFixed(1)} hrs', Icons.access_time, Colors.purpleAccent)),
          ],
        ),
        const SizedBox(height: 24),

        // Visual Distance Covered Graph (Last 7 Days)
        _buildDistanceGraphCard(),
        const SizedBox(height: 24),

        // Today's Recent Transactions
        Text('Today\'s Completed Trips', style: AppText.sectionTitle),
        const SizedBox(height: 12),
        _buildTransactionsList(),
      ],
    );
  }

  // --- Lifetime View ---
  Widget _buildLifetimeView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 4 Stat Cards for Lifetime
        Row(
          children: [
            Expanded(child: _metricCard('Lifetime Earned', '₹${_lifetimeNet.toStringAsFixed(0)}', Icons.monetization_on, AppColors.gold)),
            const SizedBox(width: 12),
            Expanded(child: _metricCard('Total Distance', '${_lifetimeDistance.toStringAsFixed(0)} km', Icons.add_road, Colors.blue)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _metricCard('Total Rides Done', '$_lifetimeRides trips', Icons.check_circle_outline, AppColors.success)),
            const SizedBox(width: 12),
            Expanded(child: _metricCard('Commission Paid', '₹${_lifetimeCommission.toStringAsFixed(0)}', Icons.pie_chart_outline, Colors.orangeAccent)),
          ],
        ),
        const SizedBox(height: 24),

        // Weekly & Monthly Summary Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: cardDecoration(context: context, radius: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Periodic Earnings', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _periodSummaryCol('This Week', '₹${_weekEarnings.toStringAsFixed(0)}'),
                  Container(width: 1, height: 40, color: AppColors.borderSubtle2),
                  _periodSummaryCol('This Month', '₹${_monthEarnings.toStringAsFixed(0)}'),
                  Container(width: 1, height: 40, color: AppColors.borderSubtle2),
                  _periodSummaryCol('Gross Fares', '₹${_lifetimeTotal.toStringAsFixed(0)}'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Lifetime Distance Graph
        _buildDistanceGraphCard(),
        const SizedBox(height: 24),

        // Lifetime Earnings Activity
        Text('Recent Earnings History', style: AppText.sectionTitle),
        const SizedBox(height: 12),
        _buildTransactionsList(),
      ],
    );
  }

  Widget _periodSummaryCol(String label, String value) {
    return Column(
      children: [
        Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: AppColors.textPrimary, fontSize: 17, fontWeight: FontWeight.w800)),
      ],
    );
  }

  // --- Metric Card ---
  Widget _metricCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: cardDecoration(context: context, radius: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w500)),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 16),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(color: AppColors.textPrimary, fontSize: 20, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }

  // --- Distance Covered Visual Bar Chart ---
  Widget _buildDistanceGraphCard() {
    // Generate default 7 days if empty so chart always renders
    List<dynamic> graphData = List.from(_distanceGraph);
    if (graphData.isEmpty) {
      final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      final now = DateTime.now();
      for (int i = 6; i >= 0; i--) {
        final d = now.subtract(Duration(days: i));
        graphData.add({
          'day': days[d.weekday - 1],
          'distanceKm': 0.0,
        });
      }
    }

    double maxDistance = 20.0;
    double totalWeekDist = 0.0;
    for (var g in graphData) {
      final double dist = (g['distanceKm'] ?? 0).toDouble();
      totalWeekDist += dist;
      if (dist > maxDistance) maxDistance = dist;
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: cardDecoration(context: context, radius: 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Distance Covered (km)',
                        style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text('Daily performance over the last 7 days',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                ),
                child: Text(
                  '${totalWeekDist.toStringAsFixed(1)} km total',
                  style: const TextStyle(color: AppColors.gold, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Bar graph
          SizedBox(
            height: 145,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: graphData.map((item) {
                final double dist = (item['distanceKm'] ?? 0).toDouble();
                final String day = item['day'] ?? '';
                final double ratio = dist > 0 ? (dist / maxDistance).clamp(0.12, 1.0) : 0.06;
                final isToday = day == graphData.last['day'];

                return Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      dist > 0 ? '${dist.toStringAsFixed(dist < 10 ? 1 : 0)}k' : '0',
                      style: TextStyle(
                        color: isToday ? AppColors.gold : (dist > 0 ? AppColors.textPrimary : AppColors.textMuted),
                        fontSize: 10,
                        fontWeight: isToday || dist > 0 ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      width: 24,
                      height: 85 * ratio,
                      decoration: BoxDecoration(
                        gradient: dist > 0
                            ? (isToday
                                ? const LinearGradient(
                                    colors: [Color(0xFFFFD56B), AppColors.gold],
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  )
                                : LinearGradient(
                                    colors: [
                                      AppColors.gold.withValues(alpha: 0.7),
                                      AppColors.gold.withValues(alpha: 0.35),
                                    ],
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  ))
                            : null,
                        color: dist == 0 ? AppColors.surfaceAlt : null,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: isToday ? AppColors.gold : Colors.transparent,
                          width: 1,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      day,
                      style: TextStyle(
                        color: isToday ? AppColors.gold : AppColors.textSecondary,
                        fontSize: 11,
                        fontWeight: isToday ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  // --- Transactions List ---
  Widget _buildTransactionsList() {
    if (_transactions.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(28),
        decoration: cardDecoration(context: context, radius: 20),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.receipt_long_outlined, size: 40, color: AppColors.textMuted),
              const SizedBox(height: 10),
              Text('No trip earnings recorded yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _transactions.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final t = _transactions[i];
        final amount = t['amount'] ?? 0;
        final bookingId = t['bookingId'] ?? 'TRIP';
        final route = t['route'] ?? 'Completed Ride';
        final method = t['paymentMethod'] ?? 'Online';
        final date = t['date'] != null ? DateTime.tryParse(t['date'])?.toLocal().toString().split('.')[0] : '';
        final rideId = t['rideId'] ?? t['id'] ?? t['bookingId'];

        return Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              if (rideId != null) {
                context.push('/rides/details', extra: {'rideId': rideId.toString(), 'ride': t});
              }
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: cardDecoration(context: context, radius: 16),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.directions_car, color: AppColors.gold, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(bookingId,
                                style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                            const SizedBox(width: 6),
                            const Icon(Icons.chevron_right, size: 16, color: AppColors.gold),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(route,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        const SizedBox(height: 4),
                        Text('$date · $method',
                            style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                      ],
                    ),
                  ),
                  Text(
                    '+₹${amount.toStringAsFixed(0)}',
                    style: const TextStyle(
                      color: AppColors.success,
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
