// lib/models/faq_item.dart

/// A single expandable FAQ row on the Help & Support screen.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only — `HelpSupportScreen` seeds itself from a hardcoded `_faqs` list
/// in this file. To wire this up:
///   1. FAQs rarely need to be dynamic, but if they should be CMS-driven,
///      add `GET /api/support/faqs` and replace the `_faqs` constant below.
///   2. "Contact Support" / "Chat with us" / "Call us" in
///      `help_support_screen.dart` are currently "coming soon" SnackBars —
///      wire these to your real support channel (in-app chat SDK,
///      `tel:`/`mailto:` launch via `url_launcher`, or a support-ticket
///      `POST /api/support/tickets` endpoint), whichever the backend
///      ends up using.
///   3. The "Report an issue" entry point should eventually accept an
///      optional `relatedRideId` (see notification_item.dart) so a rider
///      can jump straight from a ride to reporting a problem with it.
/// ===========================================================================
class FaqItem {
  final String question;
  final String answer;

  const FaqItem({required this.question, required this.answer});
}

/// Placeholder FAQ content until a real CMS/backend source lands.
const List<FaqItem> mockFaqs = [
  FaqItem(
    question: 'How do I cancel a ride?',
    answer:
        'Open the ride from the "Upcoming" tab on My Rides and tap "Cancel Ride". '
        'Cancellation fees may apply if a driver has already been assigned.',
  ),
  FaqItem(
    question: 'How is my fare calculated?',
    answer:
        'Fare is based on distance, vehicle type, and current demand. You\'ll '
        'always see an estimate before confirming a ride.',
  ),
  FaqItem(
    question: 'How do I add or change a payment method?',
    answer:
        'Go to Profile > Payment Methods to add a new card/UPI ID or set a '
        'different default method.',
  ),
  FaqItem(
    question: 'What if I left something in the car?',
    answer:
        'Go to My Rides, open the relevant past ride, and use "Report an '
        'issue" — we\'ll connect you with the driver.',
  ),
  FaqItem(
    question: 'How do I delete my account?',
    answer:
        'Contact support from this screen and we\'ll guide you through '
        'account deletion and data removal.',
  ),
];
