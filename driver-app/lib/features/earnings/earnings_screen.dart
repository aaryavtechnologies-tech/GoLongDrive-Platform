import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../core/data/mock_data.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/empty_state.dart';

/// Matches app/(tabs)/earnings.tsx (§5.10) — Earnings tab.
/// Gold balance card + Today/Week/Month stat row + transaction history.
class EarningsScreen extends StatelessWidget {
  const EarningsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
        children: [
          const Text('Earnings', style: AppText.cardHeadline),
          const SizedBox(height: 20),

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
                Text('₹${MockData.weekEarnings.toStringAsFixed(0)}', style: AppText.balanceAmount),
                const SizedBox(height: 4),
                const Text('Available for withdrawal', style: TextStyle(color: Colors.black54, fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // --- Stat row ---
          Row(
            children: [
              Expanded(child: _statCard('Today', MockData.todayEarnings)),
              const SizedBox(width: 12),
              Expanded(child: _statCard('This Month', MockData.monthEarnings)),
              const SizedBox(width: 12),
              Expanded(child: _tripsCard('Trips Today', MockData.tripsToday)),
            ],
          ),
          const SizedBox(height: 24),

          const Text('Transaction History', style: AppText.sectionTitle),
          const SizedBox(height: 12),
          MockData.transactions.isEmpty
              ? Container(
                  decoration: cardDecoration(bg: AppColors.surfaceAlt, radius: 24),
                  child: const EmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: 'No transactions yet',
                    subtitle: 'Your ride earnings and withdrawals will show up here.',
                  ),
                )
              : Container(
                  decoration: cardDecoration(bg: AppColors.surfaceAlt, radius: 24),
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    children: List.generate(MockData.transactions.length, (i) {
                      final txn = MockData.transactions[i];
                      final isLast = i == MockData.transactions.length - 1;
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
                                color: (txn.isCredit ? AppColors.success : AppColors.error).withOpacity(0.15),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                txn.isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                                color: txn.isCredit ? AppColors.success : AppColors.error,
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(txn.title, style: TextStyle(color: AppColors.textPrimary, fontSize: 14)),
                                  const SizedBox(height: 2),
                                  Text(_formatDate(txn.dateTime),
                                      style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                                ],
                              ),
                            ),
                            Text(
                              '${txn.isCredit ? '+' : '-'}₹${txn.amount.toStringAsFixed(0)}',
                              style: TextStyle(
                                color: txn.isCredit ? AppColors.success : AppColors.error,
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
    );
  }

  Widget _statCard(String label, double value) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: rideCardDecoration(radius: 18),
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
      decoration: rideCardDecoration(radius: 18),
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
