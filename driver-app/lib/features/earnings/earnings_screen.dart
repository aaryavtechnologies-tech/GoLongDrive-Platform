import 'dart:convert';
import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_loader.dart';

/// Matches app/(tabs)/earnings.tsx (§5.10) — Earnings tab.
/// Gold balance card + Today/Week/Month stat row + transaction history.
class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  bool _loading = true;
  bool _refreshing = false;
  String _errorMsg = '';
  
  double _todayEarnings = 0;
  double _weekEarnings = 0;
  double _monthEarnings = 0;
  int _tripsToday = 0;
  List<dynamic> _transactions = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() {
      if (!_refreshing) _loading = true;
      _errorMsg = '';
    });

    try {
      final futures = await Future.wait([
        ApiService.get('/earnings/driver/dashboard'),
        ApiService.get('/driver/bookings/dashboard'), // needed for tripsToday if not in earnings
      ]);

      final earningsRes = futures[0];
      final dashboardRes = futures[1];

      if (earningsRes.statusCode == 200) {
        final d = jsonDecode(earningsRes.body)['data'];
        _todayEarnings = (d['todayEarnings'] ?? 0).toDouble();
        _weekEarnings = (d['thisWeekEarnings'] ?? 0).toDouble();
        _monthEarnings = (d['thisMonthEarnings'] ?? 0).toDouble();
        _transactions = d['recentTransactions'] ?? [];
      } else {
        throw Exception('Failed to load earnings');
      }

      if (dashboardRes.statusCode == 200) {
        final d = jsonDecode(dashboardRes.body)['data'];
        _tripsToday = d['stats']?['todayTrips'] ?? 0;
      }
    } catch (e) {
      if (mounted) setState(() => _errorMsg = 'Failed to load earnings. Please check your connection.');
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
          children: const [
            Text('Earnings', style: AppText.cardHeadline),
            SizedBox(height: 20),
            SkeletonCard(height: 140),
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: SkeletonCard(height: 70)),
                SizedBox(width: 12),
                Expanded(child: SkeletonCard(height: 70)),
                SizedBox(width: 12),
                Expanded(child: SkeletonCard(height: 70)),
              ],
            ),
            SizedBox(height: 24),
            SkeletonCard(height: 200),
          ],
        ),
      );
    }

    if (_errorMsg.isNotEmpty && !_refreshing) {
      return Scaffold(
        body: ErrorStateWidget(
          title: 'Oops!',
          message: _errorMsg,
          onRetry: _onRefresh,
        ),
      );
    }

    return SafeArea(
      child: RefreshIndicator(
        color: AppColors.gold,
        backgroundColor: AppColors.surface,
        onRefresh: _onRefresh,
        child: ListView(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Earnings', style: AppText.cardHeadline),
              IconButton(
                icon: Icon(Icons.refresh, color: AppColors.textSecondary),
                onPressed: _onRefresh,
              )
            ],
          ),
          const SizedBox(height: 10),

          // --- Balance card ---
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: AppGradients.goldBalanceCard,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('This Week', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Text('₹${_weekEarnings.toStringAsFixed(0)}', style: AppText.balanceAmount),
                const SizedBox(height: 4),
                const Text('Available for withdrawal', style: TextStyle(color: Colors.black54, fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // --- Stat row ---
          Row(
            children: [
              Expanded(child: _statCard('Today', _todayEarnings)),
              const SizedBox(width: 12),
              Expanded(child: _statCard('This Month', _monthEarnings)),
              const SizedBox(width: 12),
              Expanded(child: _tripsCard('Trips Today', _tripsToday)),
            ],
          ),
          const SizedBox(height: 24),

          const Text('Transaction History', style: AppText.sectionTitle),
          const SizedBox(height: 12),
          _transactions.isEmpty
              ? Container(
                  decoration: cardDecoration(bg: Theme.of(context).brightness == Brightness.dark ? AppColors.surfaceAlt : AppColors.surfaceAltLight, radius: 24, context: context),
                  child: const EmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: 'No transactions yet',
                    subtitle: 'Your ride earnings and withdrawals will show up here.',
                  ),
                )
              : Container(
                  decoration: cardDecoration(bg: Theme.of(context).brightness == Brightness.dark ? AppColors.surfaceAlt : AppColors.surfaceAltLight, radius: 24, context: context),
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    children: List.generate(_transactions.length, (i) {
                      final txn = _transactions[i];
                      final isLast = i == _transactions.length - 1;
                      
                      final title = txn['type'] ?? 'Ride Earnings';
                      final amount = (txn['amount'] ?? 0).toDouble();
                      final isCredit = true; // In driver app, usually it's all credit except withdrawals
                      final dateStr = txn['createdAt'] ?? txn['date'];
                      final date = dateStr != null ? DateTime.tryParse(dateStr) ?? DateTime.now() : DateTime.now();

                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          border: !isLast ? Border(bottom: BorderSide(color: AppColors.borderSubtle)) : null,
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: (isCredit ? AppColors.success : AppColors.error).withOpacity(0.15),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                                color: isCredit ? AppColors.success : AppColors.error,
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(title, style: TextStyle(color: AppColors.textPrimary, fontSize: 14)),
                                  const SizedBox(height: 2),
                                  Text(_formatDate(date),
                                      style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                                ],
                              ),
                            ),
                            Text(
                              '${isCredit ? '+' : '-'}₹${amount.toStringAsFixed(0)}',
                              style: TextStyle(
                                color: isCredit ? AppColors.success : AppColors.error,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ),
                ),
        ],
      ),
      ),
    );
  }

  Widget _statCard(String label, double value) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: rideCardDecoration(radius: 18, context: context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('₹${value.toStringAsFixed(0)}',
              style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _tripsCard(String label, int value) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: rideCardDecoration(radius: 18, context: context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$value', style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        ],
      ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inHours < 1) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
