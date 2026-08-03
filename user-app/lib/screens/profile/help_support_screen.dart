// lib/screens/profile/help_support_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/faq_item.dart';
import '../../widgets/back_button.dart';

/// Help & Support — reached from Profile > "Help & Support".
///
/// FAQ accordion + contact options.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only — see the full checklist in `models/faq_item.dart`. In short:
/// FAQs are hardcoded (`mockFaqs`); the three contact actions below
/// ("Chat with us", "Call us", "Email us") are all "coming soon" SnackBars
/// waiting on a real support channel (in-app chat SDK / `url_launcher`
/// `tel:`+`mailto:` / a support-ticket endpoint).
/// ===========================================================================
class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  int? _expandedIndex;

  void _showComingSoon(String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$feature — coming soon')),
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
            _buildContactRow(),
            const SizedBox(height: 28),
            Text('Frequently Asked Questions', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary))
                .animate()
                .fadeIn(delay: 120.ms, duration: 300.ms),
            const SizedBox(height: 12),
            ...List.generate(mockFaqs.length, (index) {
              final faq = mockFaqs[index];
              final expanded = _expandedIndex == index;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _FaqTile(
                  faq: faq,
                  expanded: expanded,
                  onTap: () => setState(() {
                    _expandedIndex = expanded ? null : index;
                  }),
                ),
              );
            }),
            const SizedBox(height: 12),
            Center(
              child: TextButton(
                // TODO(backend/nav): route to a real issue-report flow,
                // optionally pre-filled with a relatedRideId — see
                // models/faq_item.dart.
                onPressed: () => _showComingSoon('Report an issue'),
                child: Text('Report an issue', style: AppTextStyles.link),
              ),
            ),
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
        Text('Help & Support', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildContactRow() {
    return Row(
      children: [
        Expanded(
          child: _ContactAction(
            icon: Icons.chat_bubble_outline,
            label: 'Chat',
            // TODO(backend): wire to an in-app chat SDK.
            onTap: () => _showComingSoon('Chat with us'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ContactAction(
            icon: Icons.call_outlined,
            label: 'Call',
            // TODO(backend): launch tel: via url_launcher with a real number.
            onTap: () => _showComingSoon('Call us'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ContactAction(
            icon: Icons.mail_outline,
            label: 'Email',
            // TODO(backend): launch mailto: via url_launcher, or POST to a
            // support-ticket endpoint.
            onTap: () => _showComingSoon('Email us'),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 80.ms, duration: 300.ms);
  }
}

class _ContactAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ContactAction({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Material(
      color: colors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              Icon(icon, color: colors.accentIcon, size: 22),
              const SizedBox(height: 8),
              Text(label, style: AppTextStyles.caption.copyWith(color: colors.textPrimary)),
            ],
          ),
        ),
      ),
    );
  }
}

class _FaqTile extends StatelessWidget {
  final FaqItem faq;
  final bool expanded;
  final VoidCallback onTap;

  const _FaqTile({required this.faq, required this.expanded, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Material(
      color: colors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(child: Text(faq.question, style: AppTextStyles.body.copyWith(color: colors.textPrimary))),
                  Icon(
                    expanded ? Icons.remove_circle_outline : Icons.add_circle_outline,
                    color: colors.accentIcon,
                    size: 20,
                  ),
                ],
              ),
              AnimatedCrossFade(
                firstChild: const SizedBox(width: double.infinity, height: 0),
                secondChild: Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(faq.answer, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
                ),
                crossFadeState:
                    expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
                duration: const Duration(milliseconds: 200),
                sizeCurve: Curves.easeInOut,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
