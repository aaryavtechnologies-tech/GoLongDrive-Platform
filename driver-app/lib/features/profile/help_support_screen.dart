import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/mock_data.dart';
import '../../core/widgets/card_decoration.dart';

/// Settings → Help & Support.
/// Contact card (phone/email — display only; no `url_launcher` dependency
/// exists in this project yet, so tapping copies to clipboard instead of
/// dialing/emailing directly) plus an FAQ list. Static content, no backend
/// dependency.
class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  static const _faqs = [
    (
      'How do I update my vehicle documents?',
      'Go to Profile → My Documents and tap the document you want to replace. Re-uploaded documents are reviewed within 24 hours.',
    ),
    (
      'When are earnings paid out?',
      'Earnings are settled weekly. You can see the breakdown any time on the Earnings tab.',
    ),
    (
      'A rider cancelled — will I still get paid?',
      'A small cancellation fee applies if the rider cancels after you\u2019ve arrived at the pickup point. It shows up in your earnings history automatically.',
    ),
    (
      'How do I report an issue with a trip?',
      'Open the trip from Rides → tap it, then use "Contact Support" on that trip, or reach out below.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final profile = MockData.driverProfile;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 24, 8),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: 4),
                  const Text('Help & Support', style: AppText.cardHeadline),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: rideCardDecoration(),
                    child: Row(
                      children: [
                        const Icon(Icons.support_agent, color: AppColors.gold, size: 28),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('We\u2019re here to help',
                                  style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700)),
                              const SizedBox(height: 2),
                              Text('Support is available every day, 6am\u201311pm',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text('Contact Us', style: AppText.sectionTitle),
                  const SizedBox(height: 12),
                  Container(
                    decoration: cardDecoration(bg: AppColors.surfaceAlt, radius: 24),
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Column(
                      children: [
                        _contactRow(
                          context,
                          icon: Icons.call_outlined,
                          label: 'Call Support',
                          value: '1800 123 4567',
                        ),
                        Divider(color: AppColors.borderSubtle, height: 1, indent: 16, endIndent: 16),
                        _contactRow(
                          context,
                          icon: Icons.chat_bubble_outline,
                          label: 'Live Chat',
                          value: 'Start a conversation',
                        ),
                        Divider(color: AppColors.borderSubtle, height: 1, indent: 16, endIndent: 16),
                        _contactRow(
                          context,
                          icon: Icons.mail_outline,
                          label: 'Email Support',
                          value: 'support@ridehail.example.com',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('Frequently Asked Questions', style: AppText.sectionTitle),
                  const SizedBox(height: 12),
                  Container(
                    decoration: cardDecoration(bg: AppColors.surfaceAlt, radius: 24),
                    padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                    child: Column(
                      children: [
                        for (var i = 0; i < _faqs.length; i++) ...[
                          _faqTile(_faqs[i].$1, _faqs[i].$2),
                          if (i != _faqs.length - 1)
                            Divider(color: AppColors.borderSubtle, height: 1, indent: 16, endIndent: 16),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text('Driver ID: ${profile.phone}',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.textFaint, fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _contactRow(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Material(
      color: Colors.transparent,
      child: ListTile(
        leading: Icon(icon, color: AppColors.textMuted, size: 22),
        title: Text(label, style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text(value, style: TextStyle(color: AppColors.textFaint, fontSize: 12)),
        trailing: Icon(Icons.chevron_right, color: AppColors.textFaint, size: 20),
        onTap: () {
          Clipboard.setData(ClipboardData(text: value));
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Copied "$value"')),
          );
        },
      ),
    );
  }

  Widget _faqTile(String question, String answer) {
    return Theme(
      data: ThemeData(dividerColor: Colors.transparent),
      child: ExpansionTile(
        iconColor: AppColors.gold,
        collapsedIconColor: AppColors.textMuted,
        title: Text(question,
            style: TextStyle(color: AppColors.textPrimary, fontSize: 13.5, fontWeight: FontWeight.w600)),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        expandedCrossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(answer, style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.4)),
        ],
      ),
    );
  }
}
