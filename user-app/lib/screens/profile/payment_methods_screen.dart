// lib/screens/profile/payment_methods_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/payment_method.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/back_button.dart';
import '../../widgets/primary_button.dart';

/// Payment Methods — reached from Profile > "Payment Methods".
///
/// Lists saved cards/UPI + the always-available Cash option, lets the rider
/// set a default and add/remove methods.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only — see the full checklist in `models/payment_method.dart`. In
/// short: `_methods` is a hardcoded mock list in this State; replace with a
/// real fetch, and route "Add" through a payment-gateway SDK rather than
/// accepting raw card details in-app (the `_AddPaymentSheet` below is a
/// placeholder UI only — do not wire raw PAN/CVV fields straight to a
/// backend without tokenization).
/// ===========================================================================
class PaymentMethodsScreen extends StatefulWidget {
  const PaymentMethodsScreen({super.key});

  @override
  State<PaymentMethodsScreen> createState() => _PaymentMethodsScreenState();
}

class _PaymentMethodsScreenState extends State<PaymentMethodsScreen> {
  // TODO(backend): GET /api/user/payment-methods — see file header.
  final List<PaymentMethod> _methods = [
    const PaymentMethod(
      id: 'pm_1',
      type: PaymentMethodType.card,
      label: 'HDFC Bank •••• 4821',
      isDefault: true,
    ),
    const PaymentMethod(
      id: 'pm_2',
      type: PaymentMethodType.upi,
      label: 'rider@okhdfcbank',
    ),
  ];

  // Cash is always available and isn't part of the removable/backend list.
  static const _cashMethod = PaymentMethod(
    id: 'cash',
    type: PaymentMethodType.cash,
    label: 'Pay the driver directly',
  );

  void _setDefault(String id) {
    // TODO(backend): PATCH /api/user/payment-methods/{id}/default
    setState(() {
      for (var i = 0; i < _methods.length; i++) {
        _methods[i] = _methods[i].copyWith(isDefault: _methods[i].id == id);
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Default payment method updated')),
    );
  }

  Future<void> _confirmRemove(PaymentMethod method) async {
    final colors = AppColors.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: colors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Remove payment method?', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
        content: Text(method.label, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text('Cancel', style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(
              'Remove',
              style: AppTextStyles.body.copyWith(
                color: Colors.redAccent,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      // TODO(backend): DELETE /api/user/payment-methods/{id}
      setState(() => _methods.removeWhere((m) => m.id == method.id));
    }
  }

  Future<void> _openAddSheet() async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _AddPaymentSheet(
        onAdded: (method) {
          // TODO(backend): this should be the response of a real tokenize
          // + save call, not a client-constructed PaymentMethod.
          setState(() => _methods.add(method));
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          children: [
            _buildTopBar(),
            const SizedBox(height: 24),
            Text('Saved Methods', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary))
                .animate()
                .fadeIn(delay: 80.ms, duration: 300.ms),
            const SizedBox(height: 12),
            ..._methods.map(
              (method) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _PaymentMethodTile(
                  method: method,
                  onSetDefault: () => _setDefault(method.id),
                  onRemove: () => _confirmRemove(method),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _PaymentMethodTile(method: _cashMethod, alwaysOn: true),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _openAddSheet,
                icon: const Icon(Icons.add, color: AppColors.primaryGold),
                label: Text('Add Payment Method', style: AppTextStyles.link),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: BorderSide(color: colors.inputBorder),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ).animate().fadeIn(delay: 200.ms, duration: 300.ms),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    final colors = AppColors.of(context);
    return Row(
      children: [
        AppBackButton(onPressed: () => Navigator.of(context).pop()),
        const SizedBox(width: 16),
        Text('Payment Methods', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }
}

class _PaymentMethodTile extends StatelessWidget {
  final PaymentMethod method;
  final bool alwaysOn;
  final VoidCallback? onSetDefault;
  final VoidCallback? onRemove;

  const _PaymentMethodTile({
    required this.method,
    this.alwaysOn = false,
    this.onSetDefault,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: method.isDefault
            ? Border.all(color: AppColors.primaryGold, width: 1.2)
            : null,
      ),
      child: Row(
        children: [
          Container(
            height: 40,
            width: 40,
            decoration: BoxDecoration(
              color: colors.background,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(method.type.icon, color: AppColors.primaryGold, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(method.type.label, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                const SizedBox(height: 2),
                Text(
                  method.label,
                  style: AppTextStyles.body.copyWith(color: colors.textPrimary),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (alwaysOn)
            Text('Always available', style: AppTextStyles.caption.copyWith(color: colors.textSecondary))
          else if (method.isDefault)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primaryGold.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                'Default',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.primaryGold,
                  fontWeight: FontWeight.w600,
                ),
              ),
            )
          else
            PopupMenuButton<String>(
              color: colors.surface,
              icon: Icon(Icons.more_vert, color: colors.textSecondary),
              onSelected: (value) {
                if (value == 'default') onSetDefault?.call();
                if (value == 'remove') onRemove?.call();
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'default',
                  child: Text('Set as default', style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
                ),
                PopupMenuItem(
                  value: 'remove',
                  child: Text(
                    'Remove',
                    style: AppTextStyles.body.copyWith(color: Colors.redAccent),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

/// Placeholder "add payment method" form. In production this should hand
/// off to a payment gateway's tokenization SDK/webview instead of taking
/// raw card details directly — see the BACKEND HOOKUP note at the top of
/// this file.
class _AddPaymentSheet extends StatefulWidget {
  final ValueChanged<PaymentMethod> onAdded;

  const _AddPaymentSheet({required this.onAdded});

  @override
  State<_AddPaymentSheet> createState() => _AddPaymentSheetState();
}

class _AddPaymentSheetState extends State<_AddPaymentSheet> {
  PaymentMethodType _type = PaymentMethodType.card;
  final _detailController = TextEditingController();

  @override
  void dispose() {
    _detailController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_detailController.text.trim().isEmpty) return;

    // TODO(backend): send raw input to a tokenization SDK/webview and only
    // construct a PaymentMethod from what the gateway returns (e.g. a
    // last-4 + token id) — never store what the user typed here directly.
    widget.onAdded(
      PaymentMethod(
        id: 'pm_${DateTime.now().millisecondsSinceEpoch}',
        type: _type,
        label: _detailController.text.trim(),
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 20, 24, 28),
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Add Payment Method', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
            const SizedBox(height: 16),
            Row(
              children: [PaymentMethodType.card, PaymentMethodType.upi].map((type) {
                final selected = _type == type;
                return Padding(
                  padding: const EdgeInsets.only(right: 10),
                  child: GestureDetector(
                    onTap: () => setState(() => _type = type),
                    child: Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: selected ? AppColors.primaryGold : colors.background,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color:
                              selected ? AppColors.primaryGold : colors.inputBorder,
                        ),
                      ),
                      child: Text(
                        type.label,
                        style: AppTextStyles.caption.copyWith(
                          color: selected ? AppColors.textOnGold : colors.textSecondary,
                          fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            AppTextField(
              label: _type == PaymentMethodType.card ? 'Card Number' : 'UPI ID',
              controller: _detailController,
              keyboardType: _type == PaymentMethodType.card
                  ? TextInputType.number
                  : TextInputType.text,
              hint: _type == PaymentMethodType.card
                  ? '1234 5678 9012 3456'
                  : 'yourname@bank',
              validator: (_) => null,
            ),
            const SizedBox(height: 20),
            PrimaryButton(label: 'Save', onPressed: _submit),
          ],
        ),
      ),
    );
  }
}
