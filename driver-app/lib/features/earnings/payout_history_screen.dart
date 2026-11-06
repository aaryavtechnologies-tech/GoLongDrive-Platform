import 'dart:convert';
import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/widgets/card_decoration.dart';

class PayoutHistoryScreen extends StatefulWidget {
  const PayoutHistoryScreen({super.key});

  @override
  State<PayoutHistoryScreen> createState() => _PayoutHistoryScreenState();
}

class _PayoutHistoryScreenState extends State<PayoutHistoryScreen> {
  bool _loading = true;
  List<dynamic> _payouts = [];
  String _error = '';

  @override
  void initState() {
    super.initState();
    _fetchPayouts();
  }

  Future<void> _fetchPayouts() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final res = await ApiService.get('/earnings/driver/payouts');
      if (res.statusCode == 200) {
        final d = jsonDecode(res.body)['data'];
        setState(() {
          _payouts = d['payouts'] ?? [];
        });
      } else {
        setState(() => _error = 'Failed to load payout history');
      }
    } catch (e) {
      setState(() => _error = 'Network error while fetching payouts');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Paid':
        return AppColors.success;
      case 'Processing':
        return Colors.blue;
      case 'Rejected':
        return AppColors.error;
      case 'Pending':
      default:
        return Colors.orange;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'Paid':
        return Icons.check_circle;
      case 'Processing':
        return Icons.autorenew;
      case 'Rejected':
        return Icons.cancel;
      case 'Pending':
      default:
        return Icons.access_time;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Payout History', style: AppText.cardHeadline),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : _error.isNotEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_error, style: TextStyle(color: AppColors.textSecondary)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: _fetchPayouts,
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.gold),
                        child: const Text('Retry', style: TextStyle(color: Colors.black)),
                      ),
                    ],
                  ),
                )
              : _payouts.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.account_balance_wallet_outlined, size: 56, color: AppColors.textMuted),
                            const SizedBox(height: 16),
                            Text('No Payout Requests Yet',
                                style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Text('When you request a payout, your transaction details will appear here.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      color: AppColors.gold,
                      onRefresh: _fetchPayouts,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(20),
                        itemCount: _payouts.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 14),
                        itemBuilder: (ctx, index) {
                          final item = _payouts[index];
                          final status = (item['status'] ?? 'Pending').toString();
                          final amount = item['amount'] ?? 0;
                          final payoutId = item['payoutId'] ?? 'PO-XXXX';
                          final method = item['payoutMethod'] ?? 'Bank Transfer';
                          final reqDate = item['requestedAt'] != null
                              ? DateTime.tryParse(item['requestedAt'])?.toLocal().toString().split('.')[0]
                              : '';
                          final txRef = item['transactionReference'];
                          final note = item['adminNotes'] ?? item['rejectionReason'];

                          return Container(
                            padding: const EdgeInsets.all(18),
                            decoration: cardDecoration(context: context, radius: 18),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(payoutId,
                                            style: TextStyle(
                                                color: AppColors.textSecondary,
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600)),
                                        const SizedBox(height: 4),
                                        Text('₹${amount.toString()}',
                                            style: TextStyle(
                                                color: AppColors.textPrimary,
                                                fontSize: 22,
                                                fontWeight: FontWeight.w800)),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: _statusColor(status).withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: _statusColor(status).withValues(alpha: 0.3)),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(_statusIcon(status), size: 14, color: _statusColor(status)),
                                          const SizedBox(width: 6),
                                          Text(
                                            status.toUpperCase(),
                                            style: TextStyle(
                                                color: _statusColor(status),
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const Divider(height: 24),
                                Row(
                                  children: [
                                    Icon(
                                      method == 'UPI' ? Icons.qr_code_2 : Icons.account_balance,
                                      size: 16,
                                      color: AppColors.gold,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(method,
                                        style: TextStyle(
                                            color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
                                    const Spacer(),
                                    if (reqDate != null)
                                      Text(reqDate,
                                          style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                                  ],
                                ),
                                if (txRef != null && txRef.toString().isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  Text('Ref: $txRef',
                                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                                ],
                                if (note != null && note.toString().isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Text(
                                    status == 'Rejected' ? 'Reason: $note' : 'Note: $note',
                                    style: TextStyle(
                                        color: status == 'Rejected' ? AppColors.error : AppColors.textSecondary,
                                        fontSize: 12),
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

