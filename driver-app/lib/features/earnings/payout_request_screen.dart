import 'dart:convert';
import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/card_decoration.dart';
import 'payout_history_screen.dart';

class PayoutRequestScreen extends StatefulWidget {
  final double availableBalance;

  const PayoutRequestScreen({super.key, required this.availableBalance});

  @override
  State<PayoutRequestScreen> createState() => _PayoutRequestScreenState();
}

class _PayoutRequestScreenState extends State<PayoutRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _holderController = TextEditingController();
  final _accountController = TextEditingController();
  final _ifscController = TextEditingController();
  final _bankNameController = TextEditingController();
  final _upiController = TextEditingController();

  String _payoutMethod = 'Bank Transfer'; // 'Bank Transfer' or 'UPI'
  bool _loading = false;
  bool _loadingDetails = true;
  double _currentBalance = 0;

  @override
  void initState() {
    super.initState();
    _currentBalance = widget.availableBalance;
    _fetchSavedDetails();
  }

  Future<void> _fetchSavedDetails() async {
    try {
      final res = await ApiService.get('/earnings/driver/bank-details');
      if (res.statusCode == 200) {
        final d = jsonDecode(res.body)['data'];
        final b = d['bankDetails'] ?? {};
        setState(() {
          _currentBalance = (d['walletBalance'] ?? _currentBalance).toDouble();
          _holderController.text = b['accountHolderName'] ?? '';
          _accountController.text = b['accountNumber'] ?? '';
          _ifscController.text = b['ifscCode'] ?? '';
          _bankNameController.text = b['bankName'] ?? '';
          _upiController.text = b['upiId'] ?? '';
        });
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loadingDetails = false);
    }
  }

  Future<void> _submitPayout() async {
    if (!_formKey.currentState!.validate()) return;

    final amount = double.tryParse(_amountController.text.trim()) ?? 0;
    if (amount < 100) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Minimum payout amount is ₹100')),
      );
      return;
    }
    if (amount > _currentBalance) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Amount exceeds available balance of ₹${_currentBalance.toStringAsFixed(0)}')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      final payload = {
        'amount': amount,
        'payoutMethod': _payoutMethod,
        'accountDetails': _payoutMethod == 'UPI'
            ? {'upiId': _upiController.text.trim()}
            : {
                'accountHolderName': _holderController.text.trim(),
                'accountNumber': _accountController.text.trim(),
                'ifscCode': _ifscController.text.trim(),
                'bankName': _bankNameController.text.trim(),
              },
      };

      final res = await ApiService.post('/earnings/driver/payout-request', body: payload);
      if (res.statusCode == 200 || res.statusCode == 201) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payout request submitted successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const PayoutHistoryScreen()),
        );
      } else {
        String err = 'Failed to submit payout request';
        try {
          err = jsonDecode(res.body)['message'] ?? err;
        } catch (_) {}
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err)));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Network error. Please try again.')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _holderController.dispose();
    _accountController.dispose();
    _ifscController.dispose();
    _bankNameController.dispose();
    _upiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Request Payout', style: AppText.cardHeadline),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _loadingDetails
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Available Balance Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        gradient: AppGradients.goldBalanceCard,
                        borderRadius: BorderRadius.circular(22),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.gold.withValues(alpha: 0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          )
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Available for Payout',
                              style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 6),
                          Text('₹${_currentBalance.toStringAsFixed(2)}',
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 4),
                          const Text('Transfers typically processed within 24 hours',
                              style: TextStyle(color: Colors.white60, fontSize: 11)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Amount input
                    Text('Withdrawal Amount', style: AppText.sectionTitle),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _amountController,
                      keyboardType: TextInputType.number,
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        prefixIcon: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          child: Text('₹', style: TextStyle(color: AppColors.gold, fontSize: 24, fontWeight: FontWeight.bold)),
                        ),
                        hintText: 'Enter amount',
                        hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 16),
                        filled: true,
                        fillColor: AppColors.surface,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: AppColors.borderSubtle2)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: AppColors.borderSubtle2)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.gold, width: 2)),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Please enter payout amount';
                        final num = double.tryParse(val);
                        if (num == null || num < 100) return 'Minimum payout is ₹100';
                        if (num > _currentBalance) return 'Exceeds available balance';
                        return null;
                      },
                    ),
                    const SizedBox(height: 12),

                    // Quick select chips
                    Row(
                      children: [
                        _quickAmountChip('₹500', 500),
                        const SizedBox(width: 8),
                        _quickAmountChip('₹1000', 1000),
                        const SizedBox(width: 8),
                        _quickAmountChip('₹2000', 2000),
                        const SizedBox(width: 8),
                        _quickAmountChip('All', _currentBalance),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Payout Method Selector
                    Text('Select Payout Method', style: AppText.sectionTitle),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _methodSelector('Bank Transfer', Icons.account_balance),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _methodSelector('UPI', Icons.qr_code_2),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Account details form
                    if (_payoutMethod == 'Bank Transfer') ...[
                      _fieldLabel('Account Holder Name'),
                      _textInput(_holderController, 'e.g. Rahul Sharma'),
                      const SizedBox(height: 14),
                      _fieldLabel('Account Number'),
                      _textInput(_accountController, 'Enter bank account number', isNumber: true),
                      const SizedBox(height: 14),
                      _fieldLabel('IFSC Code'),
                      _textInput(_ifscController, 'e.g. SBIN0001234', isCaps: true),
                      const SizedBox(height: 14),
                      _fieldLabel('Bank Name'),
                      _textInput(_bankNameController, 'e.g. State Bank of India'),
                    ] else ...[
                      _fieldLabel('UPI ID (VPA)'),
                      _textInput(_upiController, 'e.g. yourname@okaxis or 9876543210@upi'),
                    ],
                    const SizedBox(height: 36),

                    // Submit button
                    AppButton(
                      label: _loading ? 'Submitting...' : 'Submit Payout Request',
                      onPressed: _loading ? null : _submitPayout,
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _quickAmountChip(String label, double amount) {
    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: () {
        if (amount <= _currentBalance) {
          _amountController.text = amount.toStringAsFixed(0);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderSubtle2),
        ),
        child: Text(label,
            style: TextStyle(
                color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
      ),
    );
  }

  Widget _methodSelector(String method, IconData icon) {
    final selected = _payoutMethod == method;
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => setState(() => _payoutMethod = method),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: selected ? AppColors.gold.withValues(alpha: 0.15) : AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? AppColors.gold : AppColors.borderSubtle2,
            width: selected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: selected ? AppColors.gold : AppColors.textSecondary, size: 28),
            const SizedBox(height: 8),
            Text(
              method,
              style: TextStyle(
                color: selected ? AppColors.gold : AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _fieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
    );
  }

  Widget _textInput(TextEditingController controller, String hint, {bool isNumber = false, bool isCaps = false}) {
    return TextFormField(
      controller: controller,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      textCapitalization: isCaps ? TextCapitalization.characters : TextCapitalization.none,
      style: TextStyle(color: AppColors.textPrimary, fontSize: 15),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppColors.borderSubtle2)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppColors.borderSubtle2)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.gold, width: 1.5)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      validator: (val) {
        if (val == null || val.trim().isEmpty) return 'This field is required';
        return null;
      },
    );
  }
}

