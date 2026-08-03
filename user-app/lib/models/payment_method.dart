// lib/models/payment_method.dart
import 'package:flutter/material.dart';

/// Kinds of payment method the rider can save/use. `cash` is always
/// implicitly available and is never added/removed by the user — it's
/// injected once by the screen, not stored in the backend list.
enum PaymentMethodType { card, upi, cash }

extension PaymentMethodTypeInfo on PaymentMethodType {
  String get label {
    switch (this) {
      case PaymentMethodType.card:
        return 'Card';
      case PaymentMethodType.upi:
        return 'UPI';
      case PaymentMethodType.cash:
        return 'Cash';
    }
  }

  IconData get icon {
    switch (this) {
      case PaymentMethodType.card:
        return Icons.credit_card;
      case PaymentMethodType.upi:
        return Icons.account_balance_wallet_outlined;
      case PaymentMethodType.cash:
        return Icons.payments_outlined;
    }
  }
}

/// A single saved payment method row.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only — `PaymentMethodsScreen` seeds itself from `_mockMethods` inside
/// the screen's State. To wire this up:
///   1. `GET /api/user/payment-methods` -> `List<PaymentMethod>` on screen
///      load (a `lib/core/data/payment_service.dart` following the
///      places_service.dart fail-quiet-and-log pattern is the natural home).
///   2. "Add payment method" -> in production this should hand off to your
///      payment gateway's tokenization SDK/webview (e.g. Razorpay/Stripe)
///      rather than accepting a raw card number in-app — never persist a PAN
///      or CVV directly. The `_AddPaymentSheet` widget here is a UI-only
///      stand-in that shows what fields the flow will eventually need.
///   3. "Set as default" -> `PATCH /api/user/payment-methods/{id}/default`.
///   4. "Remove" -> `DELETE /api/user/payment-methods/{id}`.
///   5. Card/UPI id/detail fields below are display strings only (last-4,
///      masked VPA) — the real PAN/VPA must never round-trip through the
///      client after tokenization.
/// ===========================================================================
class PaymentMethod {
  final String id;
  final PaymentMethodType type;
  final String label; // e.g. "HDFC Bank •••• 4821" or "rider@okhdfcbank"
  final bool isDefault;

  const PaymentMethod({
    required this.id,
    required this.type,
    required this.label,
    this.isDefault = false,
  });

  PaymentMethod copyWith({bool? isDefault}) {
    return PaymentMethod(
      id: id,
      type: type,
      label: label,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
